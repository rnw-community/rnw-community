import { describe, expect, it, jest } from '@jest/globals';

import { createLog } from './create-log';

import type { LogTransportInterface } from './log-transport.interface';

const makeTransport = () => {
    const log = jest.fn<LogTransportInterface['log']>();
    const debug = jest.fn<LogTransportInterface['debug']>();
    const error = jest.fn<LogTransportInterface['error']>();
    const mock: LogTransportInterface = { log, debug, error };

return { mock, log, debug, error };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeContext = (name: string): ClassMethodDecoratorContext<any, any> =>
    ({
        kind: 'method',
        name,
        static: false,
        private: false,
        access: { get: (): unknown => void 0 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as ClassMethodDecoratorContext<any, any>);

describe('createLog (stage-3 decorator)', () => {
    describe('preLog', () => {
        it('logs string preLog message', () => {
            expect.hasAssertions();
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

        it('logs function preLog message with args', () => {
            expect.hasAssertions();
            const { mock, log } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                void 0;
            };
            const wrapped = Log<readonly [number, string], void>(
                (n, s) => `calling with ${n.toString()} ${s}`
            )(originalFn as (this: unknown, ...args: readonly [number, string]) => void, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            (new TestClass().run as unknown as (n: number, s: string) => void)(5, 'test');
            expect(log).toHaveBeenCalledWith('calling with 5 test', 'TestClass::run');
        });

        it('does not emit anything when no preLog is supplied', () => {
            expect.hasAssertions();
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
            expect.hasAssertions();
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

        it('logs function postLog with result and args', () => {
            expect.hasAssertions();
            const { mock, debug } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown, n: number): number {
                return n * 2;
            };
            const wrapped = Log<readonly [number], number>(
                undefined,
                (result, n) => `result=${result.toString()} arg=${n.toString()}`
            )(originalFn as (this: unknown, ...args: readonly [number]) => number, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            (new TestClass().run as unknown as (n: number) => number)(3);
            expect(debug).toHaveBeenCalledWith('result=6 arg=3', 'TestClass::run');
        });

        it('does not emit debug when no postLog is supplied', () => {
            expect.hasAssertions();
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
            expect.hasAssertions();
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

            expect(() => void new TestClass().run()).toThrow('boom');
            expect(error).toHaveBeenCalledWith('failed', err, 'TestClass::run');
        });

        it('logs string errorLog with non-Error as undefined', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                throw ('string-error' as unknown);
            };
            const wrapped = Log<readonly unknown[], void>(undefined, undefined, 'failed')(
                originalFn,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => void new TestClass().run()).toThrow('string-error');
            expect(error).toHaveBeenCalledWith('failed', undefined, 'TestClass::run');
        });

        it('logs function errorLog with Error instance and args', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });
            const err = new Error('boom');

            const originalFn = function (this: unknown): void {
                throw err;
            };
            const wrapped = Log<readonly [string], void>(
                undefined,
                undefined,
                (e, s) => `err: ${String(e)} arg: ${s}`
            )(
                originalFn as (this: unknown, ...args: readonly [string]) => void,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => void (new TestClass().run as unknown as (s: string) => void)('input')).toThrow('boom');
            expect(error).toHaveBeenCalledWith('err: Error: boom arg: input', err, 'TestClass::run');
        });

        it('logs function errorLog with non-Error as undefined', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                throw ('non-error-value' as unknown);
            };
            const wrapped = Log<readonly [number], void>(
                undefined,
                undefined,
                (e, n) => `caught:${String(e)} n:${n.toString()}`
            )(
                originalFn as (this: unknown, ...args: readonly [number]) => void,
                makeContext('run')
            );

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => void (new TestClass().run as unknown as (n: number) => void)(9)).toThrow('non-error-value');
            expect(error).toHaveBeenCalledWith('caught:non-error-value n:9', undefined, 'TestClass::run');
        });

        it('does not emit error when no errorLog is supplied', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const Log = createLog({ transport: mock });

            const originalFn = function (this: unknown): void {
                throw new Error('oops');
            };
            const wrapped = Log<readonly unknown[], void>()(originalFn, makeContext('run'));

            class TestClass {
                readonly run = wrapped;
            }

            expect(() => void new TestClass().run()).toThrow('oops');
            expect(error).not.toHaveBeenCalled();
        });
    });

    describe('async methods (Promise)', () => {
        it('logs postLog after promise resolves', async () => {
            expect.hasAssertions();
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
            expect.hasAssertions();
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
    });
});
