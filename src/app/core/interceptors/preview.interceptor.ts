import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';

import { log } from 'ish-core/utils/dev/operators';

/**
 * add PreviewContextID to every request if it available in the SessionStorage
 */
@Injectable()
export class PreviewInterceptor implements HttpInterceptor {
  constructor(private route: ActivatedRoute) {
    console.log('THE PREVIEW INTERCEPTOR IS INITIALIZED!');
    this.route.queryParams
      .pipe(
        filter(params => params.PreviewContextID),
        map(params => params.PreviewContextID),
        log('THE PREVIEW CONTEXTID'),
        take(1)
        // TODO: end listening for PreviewContextID if there is no such parameter at the first initialization
      )
      .subscribe(value => {
        if (!sessionStorage.getItem('PreviewContextID')) {
          sessionStorage.setItem('PreviewContextID', value);
        }
      });
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const previewContextID = sessionStorage.getItem('PreviewContextID');

    if (previewContextID) {
      return next.handle(
        req.clone({
          url: `${req.url};prectx=${previewContextID}`,
        })
      );
    }

    return next.handle(req);
  }
}
