// Declarar o tipo para window.__env
declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
      production?: string;
      logLevel?: string;
      otelEnabled?: string;
      otelTracingEndpoint?: string;
      otelMetricsEndpoint?: string;
      otelSampleRate?: string;
    };
  }
}

export const environment = {
  production: (window as any).__env?.production === 'true' || true,
  apiUrl: (window as any).__env?.apiUrl || 'https://api.preceba.com/api',
  backendApiUrl: (window as any).__env?.backendApiUrl || 'http://localhost:5067',
  logLevel: (window as any).__env?.logLevel || 'info',
  enableLogging: true,
  appName: 'Angular Observability Demo',
  version: '1.0.0',
  otel: {
    enabled: (window as any).__env?.otelEnabled === 'true' || true,
    serviceName: 'angular-observability-demo',
    serviceVersion: '1.0.0',
    environment: (window as any).__env?.production === 'true' ? 'production' : 'development',
    tracing: {
      enabled: true,
      endpoint: (window as any).__env?.otelTracingEndpoint || 'https://dev.jeager.otlp.receba.digital/v1/traces',
      sampleRate: parseFloat((window as any).__env?.otelSampleRate || '0.1'), // 10% sampling in production
    },
    metrics: {
      enabled: true,
      endpoint: (window as any).__env?.otelMetricsEndpoint || 'https://dev.jeager.otlp.receba.digital/v1/metrics',
      exportIntervalMillis: 60000,
    }
  }
};
