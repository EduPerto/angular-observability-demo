import { APP_INITIALIZER, Provider } from '@angular/core';
import { initializeOpenTelemetry } from './otel.config';
import { MetricsService } from './metrics/metrics.service';

/**
 * Provides OpenTelemetry initialization and services for Angular
 *
 * Usage:
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     // ... other providers
 *     provideOpenTelemetry()
 *   ]
 * };
 * ```
 */
export function provideOpenTelemetry(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        return () => {
          initializeOpenTelemetry();
        };
      },
      multi: true,
    },
    MetricsService, // Register metrics service
  ];
}
