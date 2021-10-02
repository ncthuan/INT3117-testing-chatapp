/* eslint-disable @typescript-eslint/ban-types */
// logger.service.ts

import * as winston from 'winston';
import { LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';
import DailyRotateFile = require('winston-daily-rotate-file');

function toString(data: any): string {
  if (data === undefined) return '<undefined>';
  if (data === null) return '<null>';
  if (data.stack) return data.stack;
  return JSON.stringify(data);
}

const nestLikeConsoleFormat = () =>
  winston.format.printf(({ context, level, timestamp, message, ...meta }) => {
    chalk.default.enabled = true;
    chalk.default.level = 4;

    let metaString = '';

    if (meta)
      metaString = Object.values(meta)
        .map((item) => `${toString(item)}`)
        .join(' ');

    let levelString = chalk.default.yellow(level.toUpperCase());
    let messageString = chalk.default.green(message);
    if (level === 'error') {
      levelString = chalk.default.red(level.toUpperCase());
      messageString = chalk.default.red(message);
    }
    const dateString = new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return (
      `[${levelString}] ` +
      ('undefined' !== typeof timestamp ? `${dateString}\t` : '') +
      ('undefined' !== typeof context
        ? `${chalk.default.yellow('[' + context + ']')} `
        : '') +
      `${messageString}` +
      (metaString ? ` - ${metaString}` : '')
    );
  });

export interface AppLoggerService extends LoggerService {
  log(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  verbose(message: string, ...meta: any[]): void;
}

class AppLogger implements AppLoggerService {
  constructor(
    private context: string,
    private readonly logger: winston.Logger,
  ) {}

  log(message: string, ...meta: any[]): void {
    this.winstonLog('info', message, ...meta);
  }
  debug(message: string, ...meta: any[]): void {
    this.winstonLog('debug', message, ...meta);
  }
  error(message: string, ...meta: any[]): void {
    this.winstonLog('error', message, ...meta);
  }
  warn(message: string, ...meta: any[]): void {
    this.winstonLog('warn', message, ...meta);
  }
  verbose(message: string, ...meta: any[]): void {
    this.winstonLog('verbose', message, ...meta);
  }

  private winstonLog(level: string, message: string, ...meta: any[]) {
    const currentDate = new Date();
    this.logger.log(level, message, {
      timestamp: currentDate.toISOString(),
      context: this.context,
      ...meta,
    });
  }
}

export class LoggerFactory {
  private static logger: winston.Logger = LoggerFactory.createLogger('debug');
  // tslint:disable-next-line: ban-types
  static create(context: string | Function): AppLoggerService {
    // tslint:disable-next-line: ban-types
    const contextName =
      typeof context === 'string' ? context : (context as Function).name;
    return new AppLogger(contextName, this.logger);
  }

  static setLevel(level: string) {
    this.logger.level = level;
  }

  private static createLogger(logLevel: string) {
    return winston.createLogger({
      level: logLevel,
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          level: 'silly',
          format: nestLikeConsoleFormat(),
        }),
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '14d',
          level: 'error',
          createSymlink: true,
          symlinkName: 'error.log',
        }),
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '14d',
          createSymlink: true,
          symlinkName: 'combined.log',
        }),
      ],
    });
  }
}

export function InjectLogger(): PropertyDecorator {
  return function(target: any, propertyKey: string) {
    const context = target.constructor.name;
    // property value
    let _val = target[propertyKey];

    if (!_val) {
      _val = LoggerFactory.create(context);
      target[propertyKey] = _val;
    }

    const getter = () =>  {
      return _val;
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      enumerable: true,
      configurable: true,
    });
  };
}
