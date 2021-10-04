import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { memoize } from 'lodash-es';
import { shareReplay } from 'rxjs/operators';

export class ExternalTranslateLoader extends TranslateHttpLoader {
  constructor(http: HttpClient, url: string) {
    super(http, url);
  }

  getTranslation = memoize(lang => super.getTranslation(lang).pipe(shareReplay(1)));
}
