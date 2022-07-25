// eslint-disable-next-line max-classes-per-file
import { EMPTY, catchError, concatMap, of, throwError } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { rethrowException } from './rethrow-exception-with-logger.operator';
import { RxJSFilterError } from './rxjs-filter-error';

import type { MonoTypeOperatorFunction, Observable } from 'rxjs';

const buildLogger = (): {
    log: <T>(logMsg: (err: unknown) => string) => MonoTypeOperatorFunction<T>;
    loggedMessages: string[];
} => ({
    loggedMessages: [] as string[],
    // eslint-disable-next-line @typescript-eslint/member-ordering
    log<T>(logMsg: (err: unknown) => string): MonoTypeOperatorFunction<T> {
        return (source$: Observable<T>): Observable<T> =>
            source$.pipe(
                catchError((error: unknown) => {
                    const messageText = logMsg(error);

                    this.loggedMessages.push(messageText);

                    return throwError(() => error);
                })
            );
    },
});

describe('rethrowExceptionWithLogger', () => {
    it('should throw RxJSFilterError and log error message', async () => {
        expect.assertions(4);

        await new Promise(resolve => {
            const wantedErrorMsg = 'error message';
            const wantedLogPrefix = 'Encountered an error';
            const wantedLogMsg = `${wantedLogPrefix}: ${wantedErrorMsg}`;

            const logger = buildLogger();

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new Error(wantedErrorMsg))),
                    rethrowException(wantedLogPrefix, logger.log.bind(logger)),
                    catchError((err: unknown) => {
                        expect(getErrorMessage(err)).toBe(wantedLogPrefix);
                        expect(err instanceof RxJSFilterError).toBe(true);
                        expect(logger.loggedMessages).toHaveLength(1);
                        expect(logger.loggedMessages[0]).toBe(wantedLogMsg);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe(() => void resolve(true));
        });
    });
    it('should rethrow the error as is if the caught error is an instance of RxJSFilterError', async () => {
        expect.assertions(1);
        await new Promise(resolve => {
            const wantedErrorMsg = 'wanted error message';

            const logger = buildLogger();

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new RxJSFilterError(wantedErrorMsg))),
                    rethrowException('wrong error message', logger.log.bind(logger)),
                    catchError((err: unknown) => {
                        expect(getErrorMessage(err)).toBe(wantedErrorMsg);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe();
        });
    });
    it('should throw a custom error if caught an error of other type', async () => {
        expect.assertions(2);

        class CustomError extends Error {
            constructor(message: string) {
                super(`CustomError: ${message}`);
            }
        }

        await new Promise(resolve => {
            const wantedErrorMsg = 'error message';
            const wantedLogPrefix = 'Encountered an error';

            const logger = buildLogger();

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new Error(wantedErrorMsg))),
                    rethrowException(wantedLogPrefix, logger.log.bind(logger), CustomError),
                    catchError((err: unknown) => {
                        expect(getErrorMessage(err)).toBe(`CustomError: ${wantedLogPrefix}`);
                        expect(err instanceof CustomError).toBe(true);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe(() => void resolve(true));
        });
    });
    it('should rethrow the error as is if the caught error is an instance of passed in custom error', async () => {
        expect.assertions(2);
        await new Promise(resolve => {
            const wantedErrorMsg = 'wanted error message';

            const logger = buildLogger();

            class CustomError extends Error {}

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new CustomError(wantedErrorMsg))),
                    rethrowException('wrong error message', logger.log.bind(logger), CustomError),
                    catchError((err: unknown) => {
                        expect(getErrorMessage(err)).toBe(wantedErrorMsg);
                        expect(err instanceof CustomError).toBe(true);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe();
        });
    });
});
