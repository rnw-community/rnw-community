// eslint-disable-next-line max-classes-per-file
import { EMPTY, catchError, concatMap, of, throwError } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { rethrowException } from './rethrow-exception.operator';
import { RxJSFilterError } from './rxjs-filter-error';

// eslint-disable-next-line max-lines-per-function
describe('rethrowException', () => {
    it('should throw RxJSFilterError and log error message', async () => {
        expect.assertions(4);

        await new Promise(resolve => {
            const wantedErrorMsg = 'error message';
            const wantedLogPrefix = 'Encountered an error';
            const wantedLogMsg = `${wantedLogPrefix}: ${wantedErrorMsg}`;

            const logger = jest.fn();

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new Error(wantedErrorMsg))),
                    rethrowException(wantedLogPrefix, logger),
                    catchError((err: unknown) => {
                        expect(getErrorMessage(err)).toBe(wantedLogPrefix);
                        expect(err instanceof RxJSFilterError).toBe(true);
                        expect(logger).toHaveBeenCalledTimes(1);
                        expect(logger).toHaveBeenCalledWith(wantedLogMsg);

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

            const logger = jest.fn();

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new RxJSFilterError(wantedErrorMsg))),
                    rethrowException('wrong error message', logger),
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

            const logger = jest.fn();

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new Error(wantedErrorMsg))),
                    rethrowException(wantedLogPrefix, logger, CustomError),
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

            const logger = jest.fn();

            class CustomError extends Error {}

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new CustomError(wantedErrorMsg))),
                    rethrowException('wrong error message', logger, CustomError),
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
    it('should call custom error creator if provided', async () => {
        expect.assertions(2);

        await new Promise(resolve => {
            const wantedErrorMsg = 'custom error';

            const logger = jest.fn();

            class CustomError extends Error {}

            const errorCreator = (): Error => new CustomError('custom error');

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new Error())),
                    rethrowException('wrong error message', logger, RxJSFilterError, errorCreator),
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
    it('should allow creating exceptions with more than one argument', async () => {
        expect.assertions(3);

        await new Promise(resolve => {
            const wantedErrorMsg = 'custom error';
            const wantedAdditionalErrorMsg = 'custom additional message';

            const logger = jest.fn();

            class CustomError extends Error {
                constructor(msg: string, public readonly additionalMsg: string) {
                    super(msg);
                }
            }

            const errorCreator = (): Error => new CustomError(wantedErrorMsg, wantedAdditionalErrorMsg);

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new Error())),
                    rethrowException('wrong error message', logger, RxJSFilterError, errorCreator),
                    catchError((err: unknown) => {
                        expect(err instanceof CustomError).toBe(true);
                        expect(getErrorMessage(err)).toBe(wantedErrorMsg);
                        expect((err as CustomError).additionalMsg).toBe(wantedAdditionalErrorMsg);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe();
        });
    });
    it('should ignore passed in exceptions with more than one argument', async () => {
        expect.assertions(3);

        await new Promise(resolve => {
            const wantedErrorMsg = 'initial error';
            const wantedAdditionalErrorMsg = 'initial additional message';

            const logger = jest.fn();

            class CustomError extends Error {
                constructor(msg: string, public readonly additionalMsg: string) {
                    super(msg);
                }
            }

            const errorCreator = (msg: string): Error => new CustomError(msg, 'wrong additional message');

            of('A')
                .pipe(
                    concatMap(() => throwError(() => new CustomError(wantedErrorMsg, wantedAdditionalErrorMsg))),
                    rethrowException('wrong error message', logger, CustomError, errorCreator),
                    catchError((err: unknown) => {
                        expect(err instanceof CustomError).toBe(true);
                        expect(getErrorMessage(err)).toBe(wantedErrorMsg);
                        expect((err as CustomError).additionalMsg).toBe(wantedAdditionalErrorMsg);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe();
        });
    });
});
