import { Inject, Injectable, Scope } from '@nestjs/common';
import { catchError, concatMap, of, tap, throwError } from 'rxjs';

import { AppLogLevelEnum } from '../enum/app-log-level.enum';

import type { LoggerService } from '@nestjs/common';
import type { MonoTypeOperatorFunction, Observable } from 'rxjs';

type MessageFn<T> = (input: T) => string;
type ErrorMessageFn = (error: unknown) => string;

/**
 * RxJS wrapper for printing NestJS logs.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class NestJSRxJSLoggerService {
    protected context = '';

    constructor(@Inject('LOGGER') private readonly logger: LoggerService) {}

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

    create$(message: string, context = this.context, level: AppLogLevelEnum = AppLogLevelEnum.info): Observable<boolean> {
        return of(true).pipe(tap(() => void this.print(message, context, level)));
    }

    debug<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.debug);
    }

    error<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.error);
    }

    info<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.info);
    }

    setContext(context: string): void {
        this.context = context;
    }

    verbose<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.verbose);
    }

    warn<T>(message: MessageFn<T> | string, context = this.context): MonoTypeOperatorFunction<T> {
        return this.print$(message, context, AppLogLevelEnum.warn);
    }

    print(message: string, context = this.context, level: AppLogLevelEnum = AppLogLevelEnum.info): void {
        if (level === AppLogLevelEnum.debug) {
            // @ts-expect-error LoggerService method signature mismatch
            this.logger.debug(message, context);
        } else if (level === AppLogLevelEnum.error) {
            this.logger.error(message, context);
        } else if (level === AppLogLevelEnum.warn) {
            this.logger.warn(message, context);
        } else if (level === AppLogLevelEnum.info) {
            this.logger.log(message, context);
        } else {
            // @ts-expect-error LoggerService method signature mismatch
            this.logger.verbose(message, context);
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
