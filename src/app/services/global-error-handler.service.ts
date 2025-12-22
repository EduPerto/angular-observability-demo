import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private logger: LoggerService) {}

  handleError(error: Error): void {
    this.logger.error('Unhandled error caught by GlobalErrorHandler', {
      name: error.name,
      message: error.message,
      stack: error.stack
    }, 'GlobalErrorHandler');

    console.error('Global error:', error);
  }
}
