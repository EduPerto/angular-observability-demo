import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;
  private currentLogLevel: LogLevel;
  private logAdded$ = new Subject<LogEntry[]>();

  constructor() {
    this.currentLogLevel = this.parseLogLevel(environment.logLevel);
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      case 'none':
        return LogLevel.NONE;
      default:
        return LogLevel.INFO;
    }
  }

  debug(message: string, data?: any, source?: string): void {
    this.log(LogLevel.DEBUG, message, data, source);
  }

  info(message: string, data?: any, source?: string): void {
    this.log(LogLevel.INFO, message, data, source);
  }

  warn(message: string, data?: any, source?: string): void {
    this.log(LogLevel.WARN, message, data, source);
  }

  error(message: string, data?: any, source?: string): void {
    this.log(LogLevel.ERROR, message, data, source);
  }

  private log(level: LogLevel, message: string, data?: any, source?: string): void {
    if (!environment.enableLogging || level < this.currentLogLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      source: source || 'Unknown'
    };

    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    this.consoleLog(entry);

    // Emite o histórico atualizado para todos os observers
    this.logAdded$.next([...this.logHistory]);
  }

  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] [${LogLevel[entry.level]}] [${entry.source}]:`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix}`, style, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`%c${prefix}`, style, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix}`, style, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`%c${prefix}`, style, entry.message, entry.data || '');
        break;
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #6c757d; font-weight: bold;';
      case LogLevel.INFO:
        return 'color: #0dcaf0; font-weight: bold;';
      case LogLevel.WARN:
        return 'color: #ffc107; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #dc3545; font-weight: bold;';
      default:
        return '';
    }
  }

  getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  // Observable para se inscrever em novos logs
  onLogAdded() {
    return this.logAdded$.asObservable();
  }

  clearLogHistory(): void {
    this.logHistory = [];
    this.logAdded$.next([]);
  }

  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
    this.info('Log level changed', { newLevel: LogLevel[level] }, 'LoggerService');
  }
}
