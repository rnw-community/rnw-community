import { Inject, Injectable, Scope } from '@nestjs/common';
import { concatMap, of, tap } from 'rxjs';

import { AppLogLevelEnum } from '../app-log-level.enum';

import type { LoggerService } from '@nestjs/common';
import type { Observable } from 'rxjs';

type LogOperatorFn<T> = (source$: Observable<T>) => Observable<T>;
type MessageFn<T> = (input: T) => string;
/**
 * RxJS wrapper for printing NestJS logs.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class NestJsRxjsLoggerService {
    /**
     * Logs context value
     */
    private context = '';

    constructor(@Inject('LOGGER') private readonly logger: LoggerService) {}

    /**
     * Set current log messages context for avoiding duplication in method calls.
     *
     * This helps to reduce parameters count in other log method calls.
     *
     * @param context Log context value
     */
    setContext(context: string): void {
        this.context = context;
    }

    /**
     * Creates RxJS observable and outputs log.
     *
     * Useful for starting RxJS stream.
     *
     * TODO: Can we create void observable instead of boolean?
     *
     * @see NestJsRxjsLoggerService#setContext
     * @see AppLogLevelEnum
     *
     * @param message Message to log
     * @param context Log context value, by default outputs currently defined context,
     * @param level Log level, default level is info
     */
    create$(message: string, context = this.context, level: AppLogLevelEnum = AppLogLevelEnum.info): Observable<boolean> {
        return of(true).pipe(tap(() => void this.print(message, context, level)));
    }

    /**
     * RxJS operator for printing logs with log level: info.
     *
     * @see NestJsRxjsLoggerService#print
     * @see AppLogLevelEnum
     *
     * @param message Message to log, or MessageFn handler that receives stream input and should return message to log
     * @param context Log context value, by default outputs currently defined context,
     */
    info$<T>(message: MessageFn<T> | string, context = this.context): LogOperatorFn<T> {
        return this.print$(message, context, AppLogLevelEnum.info);
    }

    /**
     * RxJS operator for printing logs with log level: debug.
     *
     * @see NestJsRxjsLoggerService#print
     * @see AppLogLevelEnum
     *
     * @param message Message to log, or MessageFn handler that receives stream input and should return message to log
     * @param context Log context value, by default outputs currently defined context,
     */
    debug$<T>(message: MessageFn<T> | string, context = this.context): LogOperatorFn<T> {
        return this.print$(message, context, AppLogLevelEnum.debug);
    }

    /**
     * RxJS operator for printing logs with log level: warn.
     *
     * @see NestJsRxjsLoggerService#print
     * @see AppLogLevelEnum
     *
     * @param message Message to log, or MessageFn handler that receives stream input and should return message to log
     * @param context Log context value, by default outputs currently defined context,
     */
    warn$<T>(message: MessageFn<T> | string, context = this.context): LogOperatorFn<T> {
        return this.print$(message, context, AppLogLevelEnum.warn);
    }

    /**
     * RxJS operator for printing logs with log level: verbose.
     *
     * @see NestJsRxjsLoggerService#print
     * @see AppLogLevelEnum
     *
     * @param message Message to log, or MessageFn handler that receives stream input and should return message to log
     * @param context Log context value, by default outputs currently defined context,
     */
    verbose$<T>(message: MessageFn<T> | string, context = this.context): LogOperatorFn<T> {
        return this.print$(message, context, AppLogLevelEnum.verbose);
    }

    /**
     * RxJS operator for printing logs with log level: error.
     *
     * @see NestJsRxjsLoggerService#print
     * @see AppLogLevelEnum
     *
     * @param message Message to log, or MessageFn handler that receives stream input and should return message to log
     * @param context Log context value, by default outputs currently defined context,
     */
    error$<T>(message: MessageFn<T> | string, context = this.context): LogOperatorFn<T> {
        return this.print$(message, context, AppLogLevelEnum.error);
    }

    /**
     * RxJS operator for printing logs.
     * Prints log in RxJS stream and returns input stream.
     *
     * @see NestJsRxjsLoggerService#setContext
     * @see AppLogLevelEnum
     *
     * @param message Message to log, or MessageFn handler that receives stream input and should return message to log
     * @param context Log context value, by default outputs currently defined context,
     * @param level Log level
     */
    private print$<T>(message: MessageFn<T> | string, context: string, level: AppLogLevelEnum): LogOperatorFn<T> {
        return (source$: Observable<T>): Observable<T> =>
            source$.pipe(
                concatMap(input => {
                    const messageText = typeof message === 'function' ? message(input) : message;

                    this.print(messageText, context, level);

                    return [input];
                })
            );
    }

    /**
     * Inner wrapper for printing different level log messages.
     *
     * @see NestJsRxjsLoggerService#setContext
     * @see AppLogLevelEnum
     *
     * @param message Message to log
     * @param context Log context value, by default outputs currently defined context,
     * @param level Log level, default
     */
    private print(message: string, context = this.context, level: AppLogLevelEnum = AppLogLevelEnum.info): void {
        if (level === AppLogLevelEnum.debug) {
            // @ts-expect-error TODO: Why TS thinks this is wrong?
            this.logger.debug(message, context);
        } else if (level === AppLogLevelEnum.error) {
            this.logger.error(message, context);
        } else if (level === AppLogLevelEnum.warn) {
            this.logger.warn(message, context);
        } else if (level === AppLogLevelEnum.info) {
            this.logger.log(message, context);
        } else {
            // @ts-expect-error TODO: Why TS thinks this is wrong?
            this.logger.verbose(message, context);
        }
    }
}
