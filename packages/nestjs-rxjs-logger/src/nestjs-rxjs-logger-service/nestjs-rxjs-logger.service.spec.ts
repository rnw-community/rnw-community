/* eslint-disable jest/expect-expect */
import { Observable, concatMap, of, throwError } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { AppLogLevelEnum } from '../app-log-level.enum';

import { NestJSRxJSLoggerService } from './nestjs-rxjs-logger.service';

import type { LoggerService } from '@nestjs/common';

const loggerMock: LoggerService = {
    log: () => void 0,
    error: () => void 0,
    debug: () => void 0,
    warn: () => void 0,
    verbose: () => void 0,
};

const create$Test = (method: keyof typeof loggerMock, logLevel: AppLogLevelEnum) => async (): Promise<boolean> => {
    expect.assertions(2);

    return await new Promise((resolve, reject) => {
        const loggerMethod = jest.spyOn(loggerMock, method);

        const service = new NestJSRxJSLoggerService(loggerMock);
        const logMessage = 'logMessage';
        const logContext = 'logContext';

        const stream = service.create$(logMessage, logContext, logLevel);

        expect(stream).toBeInstanceOf(Observable);

        stream.subscribe({
            next: () => {
                expect(loggerMethod).toHaveBeenCalledWith(logMessage, logContext);

                resolve(true);
            },
            error: reject,
        });
    });
};

type RxJSMethod = keyof Pick<NestJSRxJSLoggerService, 'debug' | 'error' | 'info' | 'verbose' | 'warn'>;

const print$Test =
    (
        rxjsMethod: RxJSMethod,
        method: keyof typeof loggerMock,
        logMessage: string | ((input: unknown) => string),
        service = new NestJSRxJSLoggerService(loggerMock),
        logContext = ''
        // eslint-disable-next-line max-params
    ) =>
    async () => {
        expect.assertions(1);

        return await new Promise((resolve, reject) => {
            const loggerMethod = jest.spyOn(loggerMock, method);

            const getOperator = (
                messageInput: string | ((input: unknown) => string)
            ): ReturnType<NestJSRxJSLoggerService['info']> => {
                if (rxjsMethod === 'info') {
                    return service.info(messageInput, logContext);
                } else if (rxjsMethod === 'debug') {
                    return service.debug(messageInput, logContext);
                } else if (rxjsMethod === 'warn') {
                    return service.warn(messageInput, logContext);
                } else if (rxjsMethod === 'error') {
                    return service.error(messageInput, logContext);
                }

                return service.verbose(logMessage, logContext);
            };

            const stream = of(true).pipe(getOperator(logMessage));

            stream.subscribe({
                next: value => {
                    const textMessage = typeof logMessage === 'function' ? logMessage(value) : logMessage;
                    expect(loggerMethod).toHaveBeenCalledWith(textMessage, logContext);

                    resolve(true);
                },
                error: reject,
            });
        });
    };

// eslint-disable-next-line max-statements
describe('nestJsRxJSLoggerService', () => {
    it('should create observable and output log with info log level', create$Test('log', AppLogLevelEnum.info));
    it('should create observable and output log with info log debug', create$Test('debug', AppLogLevelEnum.debug));
    it('should create observable and output log with info log warn', create$Test('warn', AppLogLevelEnum.warn));
    it('should create observable and output log with info log error', create$Test('warn', AppLogLevelEnum.error));
    it('should create observable and output log with info log verbose', create$Test('warn', AppLogLevelEnum.verbose));

    it('should print info log message', print$Test('info', 'log', 'test-info'));
    it('should print debug log message', print$Test('debug', 'debug', 'test-debug'));
    it('should print warn log message', print$Test('warn', 'warn', 'test-warn'));
    it('should print error log message', print$Test('error', 'error', 'test-error'));
    it('should print verbose log message', print$Test('verbose', 'verbose', 'test-verbose'));

    it(
        'should print info with log message function',
        print$Test('info', 'log', () => 'test-info')
    );
    it(
        'should print debug with log message function',
        print$Test('debug', 'debug', () => 'test-debug')
    );
    it(
        'should print warn with log message function',
        print$Test('warn', 'warn', () => 'test-warn')
    );
    it(
        'should print error with log message function',
        print$Test('error', 'error', () => 'test-error')
    );
    it(
        'should print verbose with log message function',
        print$Test('verbose', 'verbose', () => 'test-verbose')
    );

    it('should set log context', async () => {
        expect.assertions(2);

        const service = new NestJSRxJSLoggerService(loggerMock);
        const logContext = 'customContext';

        service.setContext(logContext);

        await print$Test('info', 'log', logContext, service)();
    });

    it('should catch stream error and print error with error message function', async () => {
        expect.assertions(1);

        await new Promise((resolve, reject) => {
            const loggerMethod = jest.spyOn(loggerMock, 'error');
            const service = new NestJSRxJSLoggerService(loggerMock);

            const initialMessage = 'initial error';
            const errorMessageFn = (error: unknown): string => `Modified ${getErrorMessage(error)}`;

            const stream = of(true).pipe(
                concatMap(() => throwError(() => new Error(initialMessage))),
                service.catch(errorMessageFn)
            );

            stream.subscribe({
                next: reject,
                error: (error: unknown) => {
                    expect(loggerMethod).toHaveBeenCalledWith(errorMessageFn(error), '');
                    resolve(true);
                },
            });
        });
    });
});
