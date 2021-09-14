import { APP_BASE_HREF } from '@angular/common';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, combineLatest, from, of, race, timer } from 'rxjs';
import { catchError, filter, first, map, mapTo, switchMap, switchMapTo, take, tap } from 'rxjs/operators';

import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { UserData } from 'ish-core/models/user/user.interface';
import { ApiService } from 'ish-core/services/api/api.service';
import { getSsoRegistrationCancelled, getSsoRegistrationRegistered } from 'ish-core/store/customer/sso-registration';
import {
  getLoggedInCustomer,
  getUserAuthorized,
  getUserLoading,
  loadUserByAPIToken,
} from 'ish-core/store/customer/user';
import { ApiTokenService } from 'ish-core/utils/api-token/api-token.service';
import { whenTruthy } from 'ish-core/utils/operators';

import { IdentityProvider, TriggerReturnType } from './identity-provider.interface';

export interface AzureADConfig {
  type: 'azureAD';
  domain: string;
  clientID: string;
}

@Injectable({ providedIn: 'root' })
export class AzureADIdentityProvider implements IdentityProvider {
  constructor(
    private oauthService: OAuthService,
    private apiService: ApiService,
    private store: Store,
    private router: Router,
    private apiTokenService: ApiTokenService,
    @Inject(APP_BASE_HREF) private baseHref: string
  ) {}

  getCapabilities() {
    return {
      editPassword: false,
      editEmail: false,
      editProfile: false,
    };
  }

  init(config: AzureADConfig) {
    const effectiveOrigin = this.baseHref === '/' ? window.location.origin : window.location.origin + this.baseHref;

    this.oauthService.configure({
      // Your AzureAD app's domain
      // Important: Don't forget to start with https:// AND the trailing slash!
      issuer: `https://${config.domain}`,

      // The app's clientId configured in AzureAD
      clientId: config.clientID,

      // The app's redirectUri configured in AzureAD
      redirectUri: effectiveOrigin + '/loading',

      // logout redirect URL
      postLogoutRedirectUri: effectiveOrigin,

      // Scopes ("rights") the Angular application wants get delegated
      // https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
      scope: 'openid email profile offline_access',

      // Using Authorization Code Flow
      // (PKCE is activated by default for authorization code flow)
      responseType: 'code',

      // Your AzureAD account's logout url
      // Derive it from your application's domain
      logoutUrl: `https://${config.domain}/v2/logout`,

      sessionChecksEnabled: true,
      strictDiscoveryDocumentValidation: false,
    });
    this.oauthService.setupAutomaticSilentRefresh();
    this.apiTokenService
      .restore$(['basket', 'order'])
      .pipe(
        switchMap(() => from(this.oauthService.loadDiscoveryDocumentAndTryLogin())),
        switchMapTo(
          timer(0, 200).pipe(
            map(() => this.oauthService.getIdToken()),
            take(100),
            whenTruthy(),
            take(1)
          )
        ),
        whenTruthy(),
        switchMap(idToken => {
          const inviteUserId = window.sessionStorage.getItem('invite-userid');
          const inviteHash = window.sessionStorage.getItem('invite-hash');
          return inviteUserId && inviteHash
            ? this.inviteRegistration(idToken, inviteUserId, inviteHash).pipe(
                tap(() => {
                  window.sessionStorage.removeItem('invite-userid');
                  window.sessionStorage.removeItem('invite-hash');
                })
              )
            : this.normalSignInRegistration(idToken);
        })
      )
      .subscribe(() => {
        this.apiTokenService.removeApiToken();
        if (this.router.url.startsWith('/loading') || this.router.url.startsWith('/register')) {
          this.router.navigateByUrl(this.oauthService.state ? decodeURIComponent(this.oauthService.state) : '/account');
        }
      });
  }

  private normalSignInRegistration(idToken: string) {
    return this.apiService
      .post<UserData>('users/processtoken', {
        id_token: idToken,
        options: ['CREATE_USER'],
      })
      .pipe(
        tap(() => {
          this.store.dispatch(loadUserByAPIToken());
        }),
        switchMap((userData: UserData) =>
          combineLatest([this.store.pipe(select(getLoggedInCustomer)), this.store.pipe(select(getUserLoading))]).pipe(
            filter(([, loading]) => !loading),
            first(),
            switchMap(([customer]) =>
              !customer
                ? this.router.navigate(['/register', 'sso'], {
                    queryParams: {
                      userid: userData.businessPartnerNo,
                      firstName: userData.firstName,
                      lastName: userData.lastName,
                    },
                  })
                : of(false)
            ),
            switchMap((navigated: boolean) =>
              navigated || navigated === null
                ? race(
                    this.store.pipe(
                      select(getSsoRegistrationRegistered),
                      whenTruthy(),
                      tap(() => {
                        this.store.dispatch(loadUserByAPIToken());
                      })
                    ),
                    this.store.pipe(
                      select(getSsoRegistrationCancelled),
                      whenTruthy(),
                      mapTo(false),
                      tap(() => this.router.navigateByUrl('/logout'))
                    )
                  )
                : of(navigated)
            )
          )
        ),
        switchMapTo(this.store.pipe(select(getUserAuthorized), whenTruthy(), first())),
        catchError((error: HttpError) => {
          this.apiTokenService.removeApiToken();
          this.triggerLogout();
          return of(error);
        })
      );
  }

  private inviteRegistration(idToken: string, userId: string, hash: string) {
    return this.apiService
      .post<UserData>('users/processtoken', {
        id_token: idToken,
        secure_user_ref: {
          user_id: userId,
          secure_code: hash,
        },
        options: ['UPDATE'],
      })
      .pipe(
        tap(() => {
          this.store.dispatch(loadUserByAPIToken());
        }),
        switchMapTo(this.store.pipe(select(getUserAuthorized), whenTruthy(), first())),
        catchError((error: HttpError) => {
          this.apiTokenService.removeApiToken();
          this.triggerLogout();
          return of(error);
        })
      );
  }

  triggerRegister(route: ActivatedRouteSnapshot): TriggerReturnType {
    if (route.queryParamMap.get('userid')) {
      return of(true);
    } else {
      this.router.navigateByUrl('/loading');
      return this.oauthService.loadDiscoveryDocumentAndLogin({
        state: route.queryParams.returnUrl,
      });
    }
  }

  triggerLogin(route: ActivatedRouteSnapshot): TriggerReturnType {
    this.router.navigateByUrl('/loading');
    return this.oauthService.loadDiscoveryDocumentAndLogin({
      state: route.queryParams.returnUrl,
    });
  }

  triggerInvite(route: ActivatedRouteSnapshot): TriggerReturnType {
    this.router.navigateByUrl('/loading');
    window.sessionStorage.setItem('invite-userid', route.queryParams.uid);
    window.sessionStorage.setItem('invite-hash', route.queryParams.Hash);
    return this.oauthService.loadDiscoveryDocumentAndLogin({
      state: route.queryParams.returnUrl,
    });
  }

  triggerLogout(): TriggerReturnType {
    if (this.oauthService.hasValidIdToken()) {
      this.oauthService.logOut(false);
      return this.router.parseUrl('/loading');
    } else {
      return false;
    }
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.oauthService.getIdToken()) {
      // fallback to standard handling
      return this.apiTokenService.intercept(req, next);
    }

    const newRequest =
      this.oauthService.getIdToken() &&
      !req.url.endsWith('users/processtoken') &&
      !req.headers.has(ApiService.TOKEN_HEADER_KEY)
        ? req.clone({
            headers: req.headers.set(ApiService.AUTHORIZATION_HEADER_KEY, 'Bearer ' + this.oauthService.getIdToken()),
          })
        : req;
    return next.handle(newRequest);
  }
}
