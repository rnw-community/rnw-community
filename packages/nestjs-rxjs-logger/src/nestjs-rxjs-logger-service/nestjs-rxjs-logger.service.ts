import { Inject, Injectable, Scope } from '@nestjs/common';
import { catchError, concatMap, of, tap, throwError } from 'rxjs';

import { AppLogLevelEnum } from '../enum/app-log-level.enum';

import type { LoggerService } from '@nestjs/common';
import type { MonoTypeOperatorFunction, Observable } from 'rxjs';

type MessageFn<T> = (input: T) => string;
type ErrorMessageFn = (error: unknown) => string;

/**
 * A transient-scoped NestJS service exposing pipeable RxJS operators that log stream values through the NestJS `Logger`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#nestjsrxjsloggerservice
 */
@Injectable({ scope: Scope.TRANSIENT })
export class NestJSRxJSLoggerService {
    protected context = '';

    constructor(@Inject('LOGGER') private readonly logger: LoggerService) {}

    /**
     * Pipeable operator that logs a stream error at the `error` level and rethrows it.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#catch-and-rethrow-example
     */
    catch<T>(message: ErrorMessageFn, context = this.context): MonoTypeOperatorFunction<T> {
        return (source$: Observable<T>): Observable<T> =>
            source$.pipe(
                catchError((error: unknown) => {
                    const messageText = message(error);

                    this.print(messageText, context, AppLogLevelEnum.error);

                    return throwError(() => error);
                })
            );
    }

    /**
     * Starts a new stream that logs the message at the given level and emits `true`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#create-stream-example
     */
    create$(message: string, context = this.context, level: AppLogLevelEnum = AppLogLevelEnum.info): Observable<boolean> {
        return of(true).pipe(tap(() => void this.print(message, context, level)));
    }

    /**
     * Pipeable operator that logs each emitted value at the `debug` level and passes it through.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#basic-operators-example
     */
    debug<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.debug);
    }

    /**
     * Pipeable operator that logs each emitted value at the `error` level and passes it through.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#basic-operators-example
     */
    error<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.error);
    }

    /**
     * Pipeable operator that logs each emitted value at the `info` level and passes it through.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#basic-operators-example
     */
    info<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.info);
    }

    /**
     * Sets the default context used by every logging method called without an explicit context.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#set-logger-context
     */
    setContext(context: string): void {
        this.context = context;
    }

    /**
     * Pipeable operator that logs each emitted value at the `verbose` level and passes it through.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#basic-operators-example
     */
    verbose<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.verbose);
    }

    /**
     * Pipeable operator that logs each emitted value at the `warn` level and passes it through.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#basic-operators-example
     */
    warn<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.warn);
    }

    /**
     * Logs a message imperatively at the given level, outside of any stream.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-logger/readme.md#nestjsrxjsloggerservice
     */
    print(message: string, context = this.context, level: AppLogLevelEnum = AppLogLevelEnum.info): void {
        if (level === AppLogLevelEnum.debug) {
            this.logger.debug?.(message, context);
        } else if (level === AppLogLevelEnum.error) {
            this.logger.error(message, context);
        } else if (level === AppLogLevelEnum.warn) {
            this.logger.warn(message, context);
        } else if (level === AppLogLevelEnum.info) {
            this.logger.log(message, context);
        } else {
            this.logger.verbose?.(message, context);
        }
    }

    private print$<T>(message: MessageFn<T> | string, context: string, level: AppLogLevelEnum): MonoTypeOperatorFunction<T> {
        return (source$: Observable<T>): Observable<T> =>
            source$.pipe(
                concatMap(input => {
                    const messageText = typeof message === 'function' ? message(input) : message;

                    this.print(messageText, context, level);

                    return [input];
                })
            );
    }
}
