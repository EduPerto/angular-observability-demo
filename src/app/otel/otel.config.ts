import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { environment } from '../../environments/environment';

let isInitialized = false;

/**
 * Initializes OpenTelemetry SDK for tracing and metrics
 */
export function initializeOpenTelemetry(): void {
  if (isInitialized || !environment.otel.enabled) {
    console.log('[OpenTelemetry] Skipping initialization (already initialized or disabled)');
    return;
  }

  console.log('[OpenTelemetry] Initializing...');

  // Create resource attributes
  const resource = new Resource({
    [ATTR_SERVICE_NAME]: environment.otel.serviceName,
    [ATTR_SERVICE_VERSION]: environment.otel.serviceVersion,
    'deployment.environment': environment.otel.environment,
  });

  // ----- TRACING SETUP -----
  if (environment.otel.tracing.enabled) {
    const traceExporter = new OTLPTraceExporter({
      url: environment.otel.tracing.endpoint,
      headers: {},
    });

    const tracerProvider = new WebTracerProvider({
      resource,
    });

    tracerProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));

    // Register Zone.js context manager (CRITICAL for Angular)
    tracerProvider.register({
      contextManager: new ZoneContextManager(),
    });

    // Auto-instrumentation for HTTP requests
    registerInstrumentations({
      instrumentations: [
        new XMLHttpRequestInstrumentation({
          propagateTraceHeaderCorsUrls: [/.*/], // Propagate headers to all domains
          clearTimingResources: true,
        }),
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls: [/.*/],
          clearTimingResources: true,
        }),
      ],
    });

    console.log('[OpenTelemetry] Tracing configured:', environment.otel.tracing.endpoint);
  }

  // ----- METRICS SETUP -----
  if (environment.otel.metrics.enabled) {
    const metricExporter = new OTLPMetricExporter({
      url: environment.otel.metrics.endpoint,
      headers: {},
    });

    const meterProvider = new MeterProvider({
      resource,
      readers: [
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: environment.otel.metrics.exportIntervalMillis,
        }),
      ],
    });

    // Register globally for access in services
    (globalThis as any).meterProvider = meterProvider;

    console.log('[OpenTelemetry] Metrics configured:', environment.otel.metrics.endpoint);
  }

  isInitialized = true;
  console.log('[OpenTelemetry] Initialization complete');
}
