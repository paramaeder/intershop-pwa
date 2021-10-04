import { isPlatformServer, registerLocaleData } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import { Inject, LOCALE_ID, NgModule, PLATFORM_ID, isDevMode } from '@angular/core';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import {
  MissingTranslationHandler,
  TranslateCompiler,
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import { TRANSLATE_LOADER_URL } from './configurations/injection-keys';
import { SSR_LOCALE } from './configurations/state-keys';
import { LocalizationsService } from './services/localizations/localizations.service';
import { ExternalTranslateLoader } from './utils/translate/external-translate-loader';
import {
  FALLBACK_LANG,
  FallbackMissingTranslationHandler,
} from './utils/translate/fallback-missing-translation-handler';
import { ICMTranslateLoader } from './utils/translate/icm-translate-loader';
import { PWATranslateCompiler } from './utils/translate/pwa-translate-compiler';

const TRANSLATE_LOADER_URL_SK = makeStateKey<string>('translateLoaderUrl');

export function translateLoaderFactory(
  transferState: TransferState,
  platformId: string,
  localizations: LocalizationsService,
  http: HttpClient,
  translateLoaderUrl: string
) {
  if (isPlatformServer(platformId) || isDevMode()) {
    const url = (typeof process !== 'undefined' && process.env.TRANSLATE_LOADER_URL) || translateLoaderUrl;
    if (url) {
      transferState.set(TRANSLATE_LOADER_URL_SK, url);
    }
  }

  if (transferState.hasKey(TRANSLATE_LOADER_URL_SK)) {
    let url = transferState.get(TRANSLATE_LOADER_URL_SK, '/TRANSLATE_LOADER_URL');
    if (!url.endsWith('/')) {
      url += '/';
    }
    return new ExternalTranslateLoader(http, url);
  }

  return new ICMTranslateLoader(transferState, platformId, localizations);
}

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [TransferState, PLATFORM_ID, LocalizationsService, HttpClient, TRANSLATE_LOADER_URL],
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: FallbackMissingTranslationHandler },
      useDefaultLang: false,
      compiler: { provide: TranslateCompiler, useClass: PWATranslateCompiler },
    }),
  ],
  providers: [{ provide: FALLBACK_LANG, useValue: 'en_US' }],
})
export class InternationalizationModule {
  constructor(
    @Inject(LOCALE_ID) angularDefaultLocale: string,
    translateService: TranslateService,
    transferState: TransferState
  ) {
    registerLocaleData(localeDe);
    registerLocaleData(localeFr);

    let defaultLang = angularDefaultLocale.replace(/\-/, '_');
    if (transferState.hasKey(SSR_LOCALE)) {
      defaultLang = transferState.get(SSR_LOCALE, defaultLang);
    }
    translateService.setDefaultLang(defaultLang);
    translateService.use(defaultLang);
  }
}
