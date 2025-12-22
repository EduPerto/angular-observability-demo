import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoggerService, LogLevel, LogEntry } from './services/logger.service';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular-observability-demo');
  protected readonly environment = environment;
  protected logHistory = signal<LogEntry[]>([]);

  constructor(
    private logger: LoggerService,
    private http: HttpClient
  ) {
    this.logger.info('Application initialized', {
      env: environment.production ? 'production' : 'development',
      version: environment.version
    }, 'App Component');
  }

  testDebugLog(): void {
    this.logger.debug('This is a debug message', { timestamp: new Date() }, 'User Action');
    this.updateLogHistory();
  }

  testInfoLog(): void {
    this.logger.info('This is an info message', { userId: 123, action: 'test' }, 'User Action');
    this.updateLogHistory();
  }

  testWarnLog(): void {
    this.logger.warn('This is a warning message', { warning: 'Resource usage high' }, 'User Action');
    this.updateLogHistory();
  }

  testErrorLog(): void {
    this.logger.error('This is an error message', { error: 'Something went wrong' }, 'User Action');
    this.updateLogHistory();
  }

  testHttpRequest(): void {
    this.logger.info('Testing HTTP request (will fail - demo only)', {}, 'User Action');
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
      next: (data) => {
        this.logger.info('HTTP request successful', { data }, 'HTTP Test');
        this.updateLogHistory();
      },
      error: (error) => {
        this.logger.error('HTTP request failed', { error }, 'HTTP Test');
        this.updateLogHistory();
      }
    });
  }

  testErrorHandling(): void {
    this.logger.info('Testing global error handler', {}, 'User Action');
    setTimeout(() => {
      throw new Error('This is a test error to demonstrate global error handling');
    }, 100);
  }

  clearLogs(): void {
    this.logger.clearLogHistory();
    this.updateLogHistory();
  }

  private updateLogHistory(): void {
    this.logHistory.set(this.logger.getLogHistory());
  }

  getLogLevelName(level: LogLevel): string {
    return LogLevel[level];
  }

  getLogLevelClass(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'log-debug';
      case LogLevel.INFO: return 'log-info';
      case LogLevel.WARN: return 'log-warn';
      case LogLevel.ERROR: return 'log-error';
      default: return '';
    }
  }
}
