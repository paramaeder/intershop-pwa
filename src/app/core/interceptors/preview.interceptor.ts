import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * add PreviewContextID to every request if it available in the SessionStorage
 */
@Injectable()
export class PreviewInterceptor implements HttpInterceptor {
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
