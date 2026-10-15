import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { ConsoleLogger, Logger } from '@nestjs/common';

import { Log } from './log.decorator';

import type { LoggerService } from '@nestjs/common';

const thrownErrorMessage = 'original failure';
const errorLogText = 'failed to process';
const logContext = 'NestLoggerTestClass::process';

class NestLoggerTestClass {
    @Log('processing', 'processed', errorLogText)
    process(): number {
        throw new Error(thrownErrorMessage);
    }

    @Log('processing', 'processed', errorLogText)
    async processAsync(): Promise<number> {
        throw new Error(thrownErrorMessage);
    }
}

const createLoggerService = (): { log: jest.Mock; error: jest.Mock; service: LoggerService } => {
    const log = jest.fn();
    const error = jest.fn();

    return { log, error, service: { log, error, warn: jest.fn(), debug: jest.fn() } };
};

describe('Log decorator with the real Nest Logger', () => {
    afterEach(() => {
        Logger.overrideLogger(new ConsoleLogger());
        jest.restoreAllMocks();
    });

    it('should forward the message, the original error and the context to a custom LoggerService', () => {
        expect.hasAssertions();

        const loggerService = createLoggerService();
        Logger.overrideLogger(loggerService.service);

        expect(() => new NestLoggerTestClass().process()).toThrow(thrownErrorMessage);
        expect(loggerService.log).toHaveBeenCalledWith('processing', logContext);

        const [message, params, context] = loggerService.error.mock.calls[0] as [string, { err: Error }, string];

        expect(message).toBe(errorLogText);
        expect(params.err).toBeInstanceOf(Error);
        expect(params.err.message).toBe(thrownErrorMessage);
        expect(context).toBe(logContext);
    });

    it('should keep the original rejection and log it through a custom LoggerService', async () => {
        expect.hasAssertions();

        const loggerService = createLoggerService();
        Logger.overrideLogger(loggerService.service);

        await expect(new NestLoggerTestClass().processAsync()).rejects.toThrow(thrownErrorMessage);
        expect(loggerService.error).toHaveBeenCalledWith(
            errorLogText,
            { err: expect.objectContaining({ message: thrownErrorMessage }) },
            'NestLoggerTestClass::processAsync'
        );
    });

    it('should print the message, the context and the original error through ConsoleLogger', () => {
        expect.hasAssertions();

        const written: string[] = [];
        const captureWrite = (chunk: string | Uint8Array): boolean => written.push(String(chunk)) > 0;
        jest.spyOn(process.stdout, 'write').mockImplementation(captureWrite);
        jest.spyOn(process.stderr, 'write').mockImplementation(captureWrite);
        Logger.overrideLogger(new ConsoleLogger({ colors: false }));

        expect(() => new NestLoggerTestClass().process()).toThrow(thrownErrorMessage);

        const output = written.join('');

        expect(output).toContain(`[${logContext}] ${errorLogText}`);
        expect(output).toContain(`Error: ${thrownErrorMessage}`);
    });
});
