/**
 * Centralized metric definitions following OpenTelemetry semantic conventions
 */

export const METRIC_NAMES = {
  HTTP_REQUESTS: 'http.client.requests',
  HTTP_DURATION: 'http.client.duration',
  LOGS: 'app.logs',
  LOG_HISTORY_SIZE: 'app.log_history.size',
} as const;

export const METRIC_DESCRIPTIONS = {
  [METRIC_NAMES.HTTP_REQUESTS]: 'Number of HTTP requests made by the client',
  [METRIC_NAMES.HTTP_DURATION]: 'Duration of HTTP requests in milliseconds',
  [METRIC_NAMES.LOGS]: 'Number of logs emitted by level',
  [METRIC_NAMES.LOG_HISTORY_SIZE]: 'Current size of in-memory log history',
} as const;

export const METRIC_UNITS = {
  [METRIC_NAMES.HTTP_REQUESTS]: '1',
  [METRIC_NAMES.HTTP_DURATION]: 'ms',
  [METRIC_NAMES.LOGS]: '1',
  [METRIC_NAMES.LOG_HISTORY_SIZE]: '1',
} as const;
