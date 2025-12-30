export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  logLevel: 'debug',
  enableLogging: true,
  appName: 'Angular Observability Demo',
  version: '1.0.0',
  otel: {
    enabled: true,
    serviceName: 'angular-observability-demo',
    serviceVersion: '1.0.0',
    environment: 'development',
    tracing: {
      enabled: true,
      endpoint: 'http://localhost:4318/v1/traces',
      sampleRate: 1.0, // 100% sampling in development
    },
    metrics: {
      enabled: true,
      endpoint: 'http://localhost:4318/v1/metrics',
      exportIntervalMillis: 60000, // Export every 60 seconds
    }
  }
};
