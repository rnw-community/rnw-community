/* eslint-disable jest/expect-expect */
import { Observable, of } from 'rxjs';

import { AppLogLevelEnum } from '../app-log-level.enum';

import { NestJsRxjsLoggerService } from './nestjs-rxjs-logger.service';

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

        const service = new NestJsRxjsLoggerService(loggerMock);
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

type RxJSMethod = keyof Pick<NestJsRxjsLoggerService, 'debug$' | 'error$' | 'info$' | 'verbose$' | 'warn$'>;

const print$Test =
    (
        rxjsMethod: RxJSMethod,
        method: keyof typeof loggerMock,
        service = new NestJsRxjsLoggerService(loggerMock),
        logContext = ''
    ) =>
    async () => {
        expect.assertions(1);

        return await new Promise((resolve, reject) => {
            const loggerMethod = jest.spyOn(loggerMock, method);

            const logMessage = 'logMessage';
            const loggerRxJSMethod = service[rxjsMethod].bind(service);

            const stream = of(true).pipe(loggerRxJSMethod(logMessage, logContext));

            stream.subscribe({
                next: () => {
                    expect(loggerMethod).toHaveBeenCalledWith(logMessage, logContext);

                    resolve(true);
                },
                error: reject,
            });
        });
    };

describe('nestJsRxJSLoggerService', () => {
    it('should create observable and output log with info log level', create$Test('log', AppLogLevelEnum.info));
    it('should create observable and output log with info log debug', create$Test('debug', AppLogLevelEnum.debug));
    it('should create observable and output log with info log warn', create$Test('warn', AppLogLevelEnum.warn));
    it('should create observable and output log with info log error', create$Test('warn', AppLogLevelEnum.error));
    it('should create observable and output log with info log verbose', create$Test('warn', AppLogLevelEnum.verbose));

    it('should print info log message', print$Test('info$', 'log'));
    it('should print debug log message', print$Test('debug$', 'debug'));
    it('should print warn log message', print$Test('warn$', 'warn'));
    it('should print error log message', print$Test('error$', 'error'));
    it('should print verbose log message', print$Test('verbose$', 'verbose'));

    it('should set log context', async () => {
        expect.assertions(2);

        const service = new NestJsRxjsLoggerService(loggerMock);
        const logContext = 'customContext';

        service.setContext(logContext);

        await print$Test('info$', 'log', service, logContext)();
    });
});
