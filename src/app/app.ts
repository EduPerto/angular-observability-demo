import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LoggerService, LogLevel, LogEntry } from './services/logger.service';
import { BackendApiService, User, Order } from './services/backend-api.service';
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

  // Distributed Tracing state
  protected apiStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  protected lastApiResponse = signal<any>(null);
  protected users = signal<User[]>([]);
  protected orders = signal<Order[]>([]);

  constructor(
    private logger: LoggerService,
    private http: HttpClient,
    private backendApi: BackendApiService
  ) {
    // Inscrever-se para atualizar a UI automaticamente quando novos logs chegarem
    this.logger.onLogAdded().subscribe(logs => {
      this.logHistory.set(logs);
    });

    this.logger.info('Application initialized', {
      env: environment.production ? 'production' : 'development',
      version: environment.version,
      backendApiUrl: environment.backendApiUrl
    }, 'App Component');
  }

  // ============================================
  // DISTRIBUTED TRACING TESTS
  // ============================================

  testHealthCheck(): void {
    this.apiStatus.set('loading');
    this.logger.info('Testing API Health Check', { endpoint: '/api/health' }, 'Distributed Tracing');

    this.backendApi.healthCheck().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('Health check successful', { data }, 'Distributed Tracing');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Health check failed', { error: error.message }, 'Distributed Tracing');
      }
    });
  }

  testGetUsers(): void {
    this.apiStatus.set('loading');
    this.logger.info('Testing GET /api/users', {}, 'Distributed Tracing');

    this.backendApi.getUsers().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.users.set(data);
        this.lastApiResponse.set(data);
        this.logger.info('Users fetched successfully', { count: data.length }, 'Distributed Tracing');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Failed to fetch users', { error: error.message }, 'Distributed Tracing');
      }
    });
  }

  testGetUserById(): void {
    const userId = Math.floor(Math.random() * 5) + 1;
    this.apiStatus.set('loading');
    this.logger.info(`Testing GET /api/users/${userId}`, { userId }, 'Distributed Tracing');

    this.backendApi.getUserById(userId).subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('User fetched successfully', { user: data }, 'Distributed Tracing');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Failed to fetch user', { error: error.message }, 'Distributed Tracing');
      }
    });
  }

  testCreateOrder(): void {
    const order = {
      userId: Math.floor(Math.random() * 5) + 1,
      productIds: [1, 2, 3] // IDs de produtos válidos do banco de dados
    };

    this.apiStatus.set('loading');
    this.logger.info('Testing POST /api/orders', { order }, 'Distributed Tracing');

    this.backendApi.createOrder(order).subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.orders.update(orders => [...orders, data]);
        this.logger.info('Order created successfully', { order: data }, 'Distributed Tracing');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Failed to create order', { error: error.message }, 'Distributed Tracing');
      }
    });
  }

  testSlowOperation(): void {
    const delayMs = 1000 + Math.floor(Math.random() * 2000);
    this.apiStatus.set('loading');
    this.logger.info(`Testing slow operation with ${delayMs}ms delay`, { delayMs }, 'Distributed Tracing');

    this.backendApi.slowOperation(delayMs).subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('Slow operation completed', { data }, 'Distributed Tracing');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Slow operation failed', { error: error.message }, 'Distributed Tracing');
      }
    });
  }

  testExternalCall(): void {
    this.apiStatus.set('loading');
    this.logger.info('Testing external call (distributed trace)', {}, 'Distributed Tracing');

    this.backendApi.externalCall().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('External call completed', { data }, 'Distributed Tracing');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('External call failed', { error: error.message }, 'Distributed Tracing');
      }
    });
  }

  // ============================================
  // ERROR SIMULATION TESTS
  // ============================================

  testBadRequest(): void {
    this.apiStatus.set('loading');
    this.logger.warn('Testing 400 Bad Request error', { endpoint: '/api/error/bad-request' }, 'Error Simulation');

    this.backendApi.simulateBadRequest().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set({ status: error.status, message: error.error });
        this.logger.error('400 Bad Request received', {
          status: error.status,
          error: error.error
        }, 'Error Simulation');
      }
    });
  }

  testNotFound(): void {
    this.apiStatus.set('loading');
    this.logger.warn('Testing 404 Not Found error', { endpoint: '/api/error/not-found' }, 'Error Simulation');

    this.backendApi.simulateNotFound().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set({ status: error.status, message: error.error });
        this.logger.error('404 Not Found received', {
          status: error.status,
          error: error.error
        }, 'Error Simulation');
      }
    });
  }

  testInternalError(): void {
    this.apiStatus.set('loading');
    this.logger.warn('Testing 500 Internal Server Error', { endpoint: '/api/error/internal' }, 'Error Simulation');

    this.backendApi.simulateInternalError().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set({ status: error.status, message: error.error });
        this.logger.error('500 Internal Server Error received', {
          status: error.status,
          error: error.error
        }, 'Error Simulation');
      }
    });
  }

  testException(): void {
    this.apiStatus.set('loading');
    this.logger.warn('Testing Unhandled Exception', { endpoint: '/api/error/exception' }, 'Error Simulation');

    this.backendApi.simulateException().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set({ status: error.status, message: error.error || error.message });
        this.logger.error('Unhandled Exception received', {
          status: error.status,
          error: error.error
        }, 'Error Simulation');
      }
    });
  }

  testDatabaseError(): void {
    this.apiStatus.set('loading');
    this.logger.warn('Testing Database Error', { endpoint: '/api/error/database' }, 'Error Simulation');

    this.backendApi.simulateDatabaseError().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set({ status: error.status, message: error.error || error.message });
        this.logger.error('Database Error received', {
          status: error.status,
          error: error.error
        }, 'Error Simulation');
      }
    });
  }

  testCascadeError(): void {
    this.apiStatus.set('loading');
    this.logger.warn('Testing Cascade Error', { endpoint: '/api/error/cascade' }, 'Error Simulation');

    this.backendApi.simulateCascadeError().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set({ status: error.status, message: error.error });
        this.logger.error('Cascade Error received', {
          status: error.status,
          error: error.error
        }, 'Error Simulation');
      }
    });
  }

  // ============================================
  // 🧪 OBSERVABILITY TESTS
  // ============================================

  testObservabilityLogs(): void {
    this.apiStatus.set('loading');
    this.logger.info('Testing Observability Logs', { endpoint: '/api/test/logs' }, 'Observability Test');

    this.backendApi.testLogs().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('Logs test completed', { traceId: data.traceId }, 'Observability Test');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Logs test failed', { error: error.message }, 'Observability Test');
      }
    });
  }

  testNestedTraces(): void {
    this.apiStatus.set('loading');
    this.logger.info('Testing Nested Traces (7 spans)', { endpoint: '/api/test/traces/nested' }, 'Observability Test');

    this.backendApi.testNestedTraces().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('Nested traces test completed', { traceId: data.traceId, spans: data.spans }, 'Observability Test');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Nested traces test failed', { error: error.message }, 'Observability Test');
      }
    });
  }

  testLatency(scenario: 'fast' | 'normal' | 'slow' | 'very-slow'): void {
    this.apiStatus.set('loading');
    this.logger.info(`Testing Latency: ${scenario}`, { endpoint: `/api/test/latency/${scenario}` }, 'Observability Test');

    this.backendApi.testLatency(scenario).subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info(`Latency test completed: ${data.delayMs}ms`, { scenario, delayMs: data.delayMs }, 'Observability Test');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Latency test failed', { error: error.message }, 'Observability Test');
      }
    });
  }

  testBatchProcessing(): void {
    const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);
    this.apiStatus.set('loading');
    this.logger.info('Testing Batch Processing', { itemCount: items.length }, 'Observability Test');

    this.backendApi.testBatch(items).subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('Batch processing completed', { traceId: data.traceId, itemCount: data.itemCount }, 'Observability Test');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Batch processing failed', { error: error.message }, 'Observability Test');
      }
    });
  }

  testMetricsGeneration(): void {
    const iterations = 20;
    this.apiStatus.set('loading');
    this.logger.info(`Generating ${iterations} metric samples`, { iterations }, 'Observability Test');

    this.backendApi.testMetrics(iterations).subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('Metrics generation completed', { traceId: data.traceId }, 'Observability Test');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Metrics generation failed', { error: error.message }, 'Observability Test');
      }
    });
  }

  testCompleteFlow(): void {
    this.apiStatus.set('loading');
    this.logger.info('Testing Complete User Flow', { endpoint: '/api/test/complete-flow' }, 'Observability Test');

    this.backendApi.testCompleteFlow().subscribe({
      next: (data) => {
        this.apiStatus.set('success');
        this.lastApiResponse.set(data);
        this.logger.info('Complete flow test finished', { traceId: data.traceId, steps: data.steps }, 'Observability Test');
      },
      error: (error) => {
        this.apiStatus.set('error');
        this.lastApiResponse.set(error);
        this.logger.error('Complete flow test failed', { error: error.message }, 'Observability Test');
      }
    });
  }

  // ============================================
  // ORIGINAL LOGGING TESTS
  // ============================================

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

  getStatusClass(): string {
    switch (this.apiStatus()) {
      case 'loading': return 'status-loading';
      case 'success': return 'status-success';
      case 'error': return 'status-error';
      default: return 'status-idle';
    }
  }
}
