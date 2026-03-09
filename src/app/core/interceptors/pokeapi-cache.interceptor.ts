import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, shareReplay, tap, finalize } from 'rxjs';

type CachedResponse = {
  expiresAt: number;
  response: HttpResponse<unknown>;
};

const POKEAPI_BASE = 'https://pokeapi.co/api/v2/';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const responseCache = new Map<string, CachedResponse>();
const inflightRequests = new Map<string, Observable<HttpEvent<unknown>>>();

export const pokeapiCacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (req.method !== 'GET' || !req.url.startsWith(POKEAPI_BASE)) {
    return next(req);
  }

  const cacheKey = req.urlWithParams;
  const now = Date.now();
  const cached = responseCache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return new Observable<HttpEvent<unknown>>((subscriber) => {
      subscriber.next(cached.response.clone());
      subscriber.complete();
    });
  }

  const inflight = inflightRequests.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const request$ = next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        responseCache.set(cacheKey, {
          response: event.clone(),
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      }
    }),
    finalize(() => {
      inflightRequests.delete(cacheKey);
    }),
    shareReplay(1)
  );

  inflightRequests.set(cacheKey, request$);
  return request$;
};
