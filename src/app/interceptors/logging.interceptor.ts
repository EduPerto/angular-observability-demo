import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const startTime = Date.now();

  logger.info(`HTTP Request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  }, 'HTTP Interceptor');

  return next(req).pipe(
    tap(event => {
      const duration = Date.now() - startTime;
      logger.info(`HTTP Response: ${req.method} ${req.url}`, {
        duration: `${duration}ms`,
        status: (event as any).status,
        url: req.url
      }, 'HTTP Interceptor');
    }),
    catchError((error: HttpErrorResponse) => {
      const duration = Date.now() - startTime;
      logger.error(`HTTP Error: ${req.method} ${req.url}`, {
        duration: `${duration}ms`,
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        url: req.url,
        error: error.error
      }, 'HTTP Interceptor');

      return throwError(() => error);
    })
  );
};
