/* eslint-disable jest/expect-expect */
import { describe, expect, it, jest } from '@jest/globals';
import { Observable, concatMap, of, throwError } from 'rxjs';

import { getErrorMessage, isNotEmptyString } from '@rnw-community/shared';

import { AppLogLevelEnum } from '../enum/app-log-level.enum';

import { NestJSRxJSLoggerService } from './nestjs-rxjs-logger.service';

import type { LoggerService } from '@nestjs/common';

type RxJSMethod = keyof Pick<NestJSRxJSLoggerService, 'debug' | 'error' | 'info' | 'verbose' | 'warn'>;
type LoggerMethod = keyof Pick<LoggerService, 'debug' | 'error' | 'log' | 'verbose' | 'warn'>;

const loggerMock: LoggerService = {
    log: () => void 0,
    error: () => void 0,
    debug: () => void 0,
    warn: () => void 0,
    verbose: () => void 0,
};

const create$Test =
    (method: LoggerMethod, logLevel?: AppLogLevelEnum, logContext = 'logContext') =>
    async (): Promise<boolean> => {
        expect.assertions(2);

        return await new Promise((resolve, reject) => {
            const loggerMethod = jest.spyOn(loggerMock, method);

            const service = new NestJSRxJSLoggerService(loggerMock);
            const logMessage = 'logMessage';

            const stream =
                logLevel === undefined ? service.create$(logMessage) : service.create$(logMessage, logContext, logLevel);

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

const print$Test =
    (
        rxjsMethod: RxJSMethod,
        method: LoggerMethod,
        logMessage: string | ((input: unknown) => string),
        service = new NestJSRxJSLoggerService(loggerMock),
        logContext = '',
        expectAssertions = 1
        // eslint-disable-next-line @typescript-eslint/max-params
    ) =>
    async () => {
        if (expectAssertions > 0) {
            expect.assertions(1);
        }

        return await new Promise((resolve, reject) => {
            const loggerMethod = jest.spyOn(loggerMock, method);

            const getOperator = (
                messageInput: string | ((input: unknown) => string)
            ): ReturnType<NestJSRxJSLoggerService['info']> => {
                if (isNotEmptyString(logContext)) {
                    return service[rxjsMethod](messageInput, logContext);
                }

                return service[rxjsMethod](logMessage);
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
    it('should create observable with default context and log level', create$Test('warn'));

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
        expect.assertions(5);

        const service = new NestJSRxJSLoggerService(loggerMock);
        const logMessage = 'testMessage';
        const logContext = 'customContext';

        service.setContext(logContext);

        await print$Test('info', 'log', logMessage, service, logContext, 0)();
        await print$Test('warn', 'warn', logMessage, service, logContext, 0)();
        await print$Test('error', 'error', logMessage, service, logContext, 0)();
        await print$Test('verbose', 'verbose', logMessage, service, logContext, 0)();
        await print$Test('debug', 'debug', logMessage, service, logContext, 0)();
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

    it('should print with default context and log level', () => {
        expect.assertions(1);

        const service = new NestJSRxJSLoggerService(loggerMock);

        const loggerMethod = jest.spyOn(loggerMock, 'log');
        const testMessage = 'test';

        service.print(testMessage);
        expect(loggerMethod).toHaveBeenCalledWith(testMessage, '');
    });
});
