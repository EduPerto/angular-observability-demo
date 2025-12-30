(function (window) {
    window.__env = window.__env || {};

    // Essas variáveis serão substituídas em runtime pelo script do Docker
    window.__env.apiUrl = '${NG_APP_API_URL}';
    window.__env.production = '${NG_APP_PRODUCTION}';
    window.__env.logLevel = '${NG_APP_LOG_LEVEL}';

    // OpenTelemetry configuration
    window.__env.otelEnabled = '${NG_APP_OTEL_ENABLED}';
    window.__env.otelTracingEndpoint = '${NG_APP_OTEL_TRACING_ENDPOINT}';
    window.__env.otelMetricsEndpoint = '${NG_APP_OTEL_METRICS_ENDPOINT}';
    window.__env.otelSampleRate = '${NG_APP_OTEL_SAMPLE_RATE}';
})(this);
