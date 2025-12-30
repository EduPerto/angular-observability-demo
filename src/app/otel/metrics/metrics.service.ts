import { Injectable } from '@angular/core';
import { metrics } from '@opentelemetry/api';
import { Counter, Histogram, ObservableGauge } from '@opentelemetry/api';
import { LogLevel } from '../../services/logger.service';
import { environment } from '../../../environments/environment';
import { METRIC_NAMES, METRIC_DESCRIPTIONS, METRIC_UNITS } from './metric-definitions';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private meter = metrics.getMeter('angular-app-metrics');

  // Metrics
  private httpRequestsCounter: Counter;
  private httpLatencyHistogram: Histogram;
  private logsCounter: Counter;
  private logHistorySizeGauge: ObservableGauge | null = null;

  constructor() {
    if (!environment.otel.metrics.enabled) {
      return;
    }

    // HTTP Requests counter by status code
    this.httpRequestsCounter = this.meter.createCounter(METRIC_NAMES.HTTP_REQUESTS, {
      description: METRIC_DESCRIPTIONS[METRIC_NAMES.HTTP_REQUESTS],
      unit: METRIC_UNITS[METRIC_NAMES.HTTP_REQUESTS],
    });

    // HTTP Latency histogram
    this.httpLatencyHistogram = this.meter.createHistogram(METRIC_NAMES.HTTP_DURATION, {
      description: METRIC_DESCRIPTIONS[METRIC_NAMES.HTTP_DURATION],
      unit: METRIC_UNITS[METRIC_NAMES.HTTP_DURATION],
    });

    // Logs counter by level
    this.logsCounter = this.meter.createCounter(METRIC_NAMES.LOGS, {
      description: METRIC_DESCRIPTIONS[METRIC_NAMES.LOGS],
      unit: METRIC_UNITS[METRIC_NAMES.LOGS],
    });
  }

  /**
   * Records an HTTP request with status and duration
   */
  recordHttpRequest(method: string, url: string, statusCode: number, durationMs: number): void {
    if (!environment.otel.metrics.enabled) return;

    this.httpRequestsCounter.add(1, {
      'http.method': method,
      'http.status_code': statusCode,
      'http.url': url,
    });

    this.httpLatencyHistogram.record(durationMs, {
      'http.method': method,
      'http.status_code': statusCode,
    });
  }

  /**
   * Records a log entry by level
   */
  recordLog(level: LogLevel): void {
    if (!environment.otel.metrics.enabled) return;

    this.logsCounter.add(1, {
      'log.level': LogLevel[level],
    });
  }

  /**
   * Registers an observable gauge for log history size
   */
  registerLogHistorySizeGauge(getLogHistorySize: () => number): void {
    if (!environment.otel.metrics.enabled) return;

    this.logHistorySizeGauge = this.meter.createObservableGauge(METRIC_NAMES.LOG_HISTORY_SIZE, {
      description: METRIC_DESCRIPTIONS[METRIC_NAMES.LOG_HISTORY_SIZE],
      unit: METRIC_UNITS[METRIC_NAMES.LOG_HISTORY_SIZE],
    });

    this.logHistorySizeGauge.addCallback((observableResult) => {
      const size = getLogHistorySize();
      observableResult.observe(size);
    });
  }
}
