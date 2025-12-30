/**
 * TypeScript types for OpenTelemetry configuration
 */

export interface OtelConfig {
  enabled: boolean;
  serviceName: string;
  serviceVersion: string;
  environment: string;
  tracing: OtelTracingConfig;
  metrics: OtelMetricsConfig;
}

export interface OtelTracingConfig {
  enabled: boolean;
  endpoint: string;
  sampleRate: number;
}

export interface OtelMetricsConfig {
  enabled: boolean;
  endpoint: string;
  exportIntervalMillis: number;
}

/**
 * Extends Window interface to include runtime configuration
 */
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
