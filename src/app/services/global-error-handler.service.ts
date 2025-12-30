import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from './logger.service';
import { trace } from '@opentelemetry/api';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggerService) {}

  handleError(error: Error): void {
    // Record error in active span if one exists
    const span = trace.getActiveSpan();
    if (span) {
      span.recordException(error);
    }

    this.logger.error('Unhandled error caught by GlobalErrorHandler', {
      name: error.name,
      message: error.message,
      stack: error.stack
    }, 'GlobalErrorHandler');

    console.error('Global error:', error);
  }
}
