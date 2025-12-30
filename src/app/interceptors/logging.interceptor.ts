import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const startTime = Date.now();

  // Create span for HTTP request
  const tracer = trace.getTracer('http-interceptor');
  const span = tracer.startSpan(`HTTP ${req.method} ${req.url}`, {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.urlWithParams,
    }
  });

  logger.info(`HTTP Request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  }, 'HTTP Interceptor');

  // Execute request within span context
  return context.with(trace.setSpan(context.active(), span), () => {
    return next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;

          // Update span with successful response
          span.setAttributes({
            'http.status_code': event.status,
            'http.response_content_length': event.body ? JSON.stringify(event.body).length : 0,
          });
          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          logger.info(`HTTP Response: ${req.method} ${req.url}`, {
            duration: `${duration}ms`,
            status: event.status,
            url: req.url
          }, 'HTTP Interceptor');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const duration = Date.now() - startTime;

        // Record error in span
        span.recordException(error);
        span.setAttributes({
          'http.status_code': error.status,
          'error.type': error.name,
          'error.message': error.message,
        });
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message
        });
        span.end();

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
  });
};
