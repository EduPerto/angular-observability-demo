import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoggerService, LogLevel, LogEntry } from './services/logger.service';
import { environment } from '../environments/environment';

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
    // Inscrever-se para atualizar a UI automaticamente quando novos logs chegarem
    this.logger.onLogAdded().subscribe(logs => {
      this.logHistory.set(logs);
    });

    this.logger.info('Application initialized', {
      env: environment.production ? 'production' : 'development',
      version: environment.version
    }, 'App Component');
  }

  testDebugLog(): void {
    this.logger.debug('This is a debug message', { timestamp: new Date() }, 'User Action');
  }

  testInfoLog(): void {
    this.logger.info('This is an info message', { userId: 123, action: 'test' }, 'User Action');
  }

  testWarnLog(): void {
    this.logger.warn('This is a warning message', { warning: 'Resource usage high' }, 'User Action');
  }

  testErrorLog(): void {
    this.logger.error('This is an error message', { error: 'Something went wrong' }, 'User Action');
  }

  testHttpRequest(): void {
    this.logger.info('Testing HTTP request', {}, 'User Action');
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe({
      next: (data) => {
        this.logger.info('HTTP request successful', { data }, 'HTTP Test');
      },
      error: (error) => {
        this.logger.error('HTTP request failed', { error }, 'HTTP Test');
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
