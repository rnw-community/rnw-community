import { describe, expect, it, jest } from '@jest/globals';

import type { LogTransportInterface } from './log-transport.interface';
import { createLog } from './create-log';

const makeTransport = () => {
    const log = jest.fn<LogTransportInterface['log']>();
    const debug = jest.fn<LogTransportInterface['debug']>();
    const error = jest.fn<LogTransportInterface['error']>();
    const mock: LogTransportInterface = { log, debug, error };
    return { mock, log, debug, error };
};

// Stage-3 decorator context shim — only `name` is used by createInterceptor.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeContext = (name: string): ClassMethodDecoratorContext<unknown, any> =>
    ({
        kind: 'method',
        name,
        static: false,
        private: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        access: { get: () => undefined as any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as ClassMethodDecoratorContext<unknown, any>);

describe('createLog (stage-3 decorator)', () => {
    describe('preLog', () => {
        it('logs string preLog message', () => {
            const { mock, log } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly unknown[], void>('starting')(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            new TestClass().run();
            expect(log).toHaveBeenCalledWith('starting', 'TestClass::run');
        });

        it('logs function preLog message with sanitized args', () => {
            const { mock, log } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly [number, string], void>(
                args => `calling with ${args[0].toString()} ${args[1]}`
            )(originalFn as (this: unknown, ...args: readonly [number, string]) => void, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            (new TestClass().run as unknown as (n: number, s: string) => void)(5, 'test');
            expect(log).toHaveBeenCalledWith('calling with 5 test', 'TestClass::run');
        });

        it('emits :begin when no preLog and measureDuration=true', () => {
            const { mock, log } = makeTransport();
            const Log = createLog({ transport: mock, measureDuration: true });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly unknown[], void>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            new TestClass().run();
            expect(log).toHaveBeenCalledWith('run:begin', 'TestClass::run');
        });

        it('does not emit anything when no preLog and measureDuration=false', () => {
            const { mock, log } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly unknown[], void>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            new TestClass().run();
            expect(log).not.toHaveBeenCalled();
        });
    });

    describe('postLog', () => {
        it('logs string postLog message via debug', () => {
            const { mock, debug } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): number {
                return 1;
            };
            const wrapped = Log<readonly unknown[], number>(undefined, 'done')(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            new TestClass().run();
            expect(debug).toHaveBeenCalledWith('done', 'TestClass::run');
        });

        it('logs function postLog with result and sanitized args', () => {
            const { mock, debug } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown, n: number): number {
                return n * 2;
            };
            const wrapped = Log<readonly [number], number>(
                undefined,
                (result, args) => `result=${result.toString()} arg=${args[0].toString()}`
            )(originalFn as (this: unknown, ...args: readonly [number]) => number, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            (new TestClass().run as unknown as (n: number) => number)(3);
            expect(debug).toHaveBeenCalledWith('result=6 arg=3', 'TestClass::run');
        });

        it('emits :done with duration when no postLog and measureDuration=true', () => {
            const { mock, debug } = makeTransport();
            const Log = createLog({ transport: mock, measureDuration: true });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly unknown[], void>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            new TestClass().run();
            expect(debug).toHaveBeenCalledWith(
                expect.stringMatching(/^run:done \(\d+\.\d+ms\)$/u),
                'TestClass::run'
            );
        });

        it('does not emit debug when no postLog and measureDuration=false', () => {
            const { mock, debug } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly unknown[], void>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            new TestClass().run();
            expect(debug).not.toHaveBeenCalled();
        });
    });

    describe('errorLog', () => {
        it('logs string errorLog with Error instance', () => {
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });
            const err = new Error('boom');

            const originalFn = function (this: unknown): void {
                throw err;
            };
            const wrapped = Log<readonly unknown[], void>(undefined, undefined, 'failed')(
                originalFn,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => new TestClass().run()).toThrow('boom');
            expect(error).toHaveBeenCalledWith('failed', err, 'TestClass::run');
        });

        it('logs string errorLog with non-Error as undefined', () => {
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                throw 'string-error';
            };
            const wrapped = Log<readonly unknown[], void>(undefined, undefined, 'failed')(
                originalFn,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => new TestClass().run()).toThrow('string-error');
            expect(error).toHaveBeenCalledWith('failed', undefined, 'TestClass::run');
        });

        it('logs function errorLog with Error instance and sanitized args', () => {
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });
            const err = new Error('boom');

            const originalFn = function (this: unknown): void {
                throw err;
            };
            const wrapped = Log<readonly [string], void>(
                undefined,
                undefined,
                (e, args) => `err: ${String(e)} arg: ${args[0]}`
            )(
                originalFn as (this: unknown, ...args: readonly [string]) => void,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => (new TestClass().run as unknown as (s: string) => void)('input')).toThrow('boom');
            expect(error).toHaveBeenCalledWith('err: Error: boom arg: input', err, 'TestClass::run');
        });

        it('logs function errorLog with non-Error as undefined', () => {
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                throw 'non-error-value';
            };
            const wrapped = Log<readonly [number], void>(
                undefined,
                undefined,
                (e, args) => `caught:${String(e)} n:${args[0].toString()}`
            )(
                originalFn as (this: unknown, ...args: readonly [number]) => void,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => (new TestClass().run as unknown as (n: number) => void)(9)).toThrow('non-error-value');
            expect(error).toHaveBeenCalledWith('caught:non-error-value n:9', undefined, 'TestClass::run');
        });

        it('emits :throw with duration when no errorLog and measureDuration=true', () => {
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock, measureDuration: true });
            const err = new Error('oops');

            const originalFn = function (this: unknown): void {
                throw err;
            };
            const wrapped = Log<readonly unknown[], void>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => new TestClass().run()).toThrow('oops');
            expect(error).toHaveBeenCalledWith(
                expect.stringMatching(/^run:throw \(\d+\.\d+ms\)$/u),
                err,
                'TestClass::run'
            );
        });

        it('does not emit error when no errorLog and measureDuration=false', () => {
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                throw new Error('oops');
            };
            const wrapped = Log<readonly unknown[], void>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => new TestClass().run()).toThrow('oops');
            expect(error).not.toHaveBeenCalled();
        });
    });

    describe('async methods (Promise)', () => {
        it('logs postLog after promise resolves', async () => {
            const { mock, debug } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = async function (this: unknown): Promise<number> {
                return Promise.resolve(42);
            };
            const wrapped = Log<readonly unknown[], Promise<number>>(undefined, 'resolved')(
                originalFn,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            await new TestClass().run();
            expect(debug).toHaveBeenCalledWith('resolved', 'TestClass::run');
        });

        it('logs errorLog after promise rejects', async () => {
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });
            const err = new Error('async-fail');

            const originalFn = async function (this: unknown): Promise<void> {
                throw err;
            };
            const wrapped = Log<readonly unknown[], Promise<void>>(undefined, undefined, 'async-failed')(
                originalFn,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            await expect(new TestClass().run()).rejects.toThrow('async-fail');
            expect(error).toHaveBeenCalledWith('async-failed', err, 'TestClass::run');
        });

        it('emits :done with duration for promise with measureDuration', async () => {
            const { mock, debug } = makeTransport();
            const Log = createLog({ transport: mock, measureDuration: true });

            const originalFn = async function (this: unknown): Promise<string> {
                return 'done';
            };
            const wrapped = Log<readonly unknown[], Promise<string>>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            await new TestClass().run();
            expect(debug).toHaveBeenCalledWith(
                expect.stringMatching(/^run:done \(\d+\.\d+ms\)$/u),
                'TestClass::run'
            );
        });
    });

    describe('custom sanitizer', () => {
        it('uses custom sanitizer for preLog function args', () => {
            const { mock, log } = makeTransport();
            const customSanitizer = jest.fn<(v: unknown) => unknown>((v) => `sanitized:${String(v)}`);
            const Log = createLog({ transport: mock, sanitizer: customSanitizer });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly [string], void>(args => `arg=${args[0]}`)(
                originalFn as (this: unknown, ...args: readonly [string]) => void,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            (new TestClass().run as unknown as (s: string) => void)('hello');
            expect(customSanitizer).toHaveBeenCalledWith('hello');
            expect(log).toHaveBeenCalledWith('arg=sanitized:hello', 'TestClass::run');
        });
    });
});
