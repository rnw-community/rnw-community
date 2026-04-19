import { describe, expect, it, jest } from '@jest/globals';

import { createLegacyLog } from './create-legacy-log';

import type { LogTransportInterface } from './log-transport.interface';

const makeTransport = () => {
    const log = jest.fn<LogTransportInterface['log']>();
    const debug = jest.fn<LogTransportInterface['debug']>();
    const error = jest.fn<LogTransportInterface['error']>();
    const mock: LogTransportInterface = { log, debug, error };

return { mock, log, debug, error };
};

describe('createLegacyLog (experimentalDecorators)', () => {
    describe('preLog', () => {
        it('logs string preLog message', () => {
            expect.hasAssertions();
            const { mock, log } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog('starting'))
                run(): void {
                    void 0;
                }
            }

            new TestClass().run();
            expect(log).toHaveBeenCalledWith('starting', 'TestClass::run');
        });

        it('logs function preLog message with args', () => {
            expect.hasAssertions();
            const { mock, log } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog<[number], undefined>(n => `n=${n.toString()}`))
                run(_n: number): void {
                    void 0;
                }
            }

            new TestClass().run(7);
            expect(log).toHaveBeenCalledWith('n=7', 'TestClass::run');
        });

        it('does not emit when no preLog is supplied', () => {
            expect.hasAssertions();
            const { mock, log } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog())
                run(): void {
                    void 0;
                }
            }

            new TestClass().run();
            expect(log).not.toHaveBeenCalled();
        });
    });

    describe('postLog', () => {
        it('logs string postLog via debug', () => {
            expect.hasAssertions();
            const { mock, debug } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog(undefined, 'done'))
                run(): number {
                    return 1;
                }
            }

            new TestClass().run();
            expect(debug).toHaveBeenCalledWith('done', 'TestClass::run');
        });

        it('logs function postLog with result and args', () => {
            expect.hasAssertions();
            const { mock, debug } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog<[number], number>(undefined, (result, n) => `r=${result.toString()} a=${n.toString()}`))
                run(n: number): number {
                    return n + 1;
                }
            }

            new TestClass().run(4);
            expect(debug).toHaveBeenCalledWith('r=5 a=4', 'TestClass::run');
        });

        it('does not emit debug when no postLog is supplied', () => {
            expect.hasAssertions();
            const { mock, debug } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog())
                run(): void {
                    void 0;
                }
            }

            new TestClass().run();
            expect(debug).not.toHaveBeenCalled();
        });
    });

    describe('errorLog', () => {
        it('logs string errorLog with Error instance', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });
            const err = new Error('boom');

            class TestClass {
                @(LegacyLog(undefined, undefined, 'failed'))
                run(): void {
                    throw err;
                }
            }

            expect(() => void new TestClass().run()).toThrow('boom');
            expect(error).toHaveBeenCalledWith('failed', err, 'TestClass::run');
        });

        it('logs string errorLog with non-Error as undefined', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog(undefined, undefined, 'failed'))
                run(): void {
                    throw (42 as unknown);
                }
            }

            expect(() => void new TestClass().run()).toThrow();
            expect(error).toHaveBeenCalledWith('failed', undefined, 'TestClass::run');
        });

        it('logs function errorLog with Error instance', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });
            const err = new Error('fail');

            class TestClass {
                @(LegacyLog<[number], undefined>(undefined, undefined, (e, n) => `err:${String(e)} n:${n.toString()}`))
                run(_n: number): void {
                    throw err;
                }
            }

            expect(() => void new TestClass().run(3)).toThrow('fail');
            expect(error).toHaveBeenCalledWith('err:Error: fail n:3', err, 'TestClass::run');
        });

        it('does not emit error when no errorLog is supplied', () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog())
                run(): void {
                    throw new Error('oops');
                }
            }

            expect(() => void new TestClass().run()).toThrow('oops');
            expect(error).not.toHaveBeenCalled();
        });
    });

    describe('async methods (Promise)', () => {
        it('logs postLog after promise resolves', async () => {
            expect.hasAssertions();
            const { mock, debug } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });

            class TestClass {
                @(LegacyLog(undefined, 'resolved'))
                async run(): Promise<number> {
                    return 99;
                }
            }

            await new TestClass().run();
            expect(debug).toHaveBeenCalledWith('resolved', 'TestClass::run');
        });

        it('logs errorLog after promise rejects', async () => {
            expect.hasAssertions();
            const { mock, error } = makeTransport();
            const LegacyLog = createLegacyLog({ transport: mock });
            const err = new Error('async-fail');

            class TestClass {
                @(LegacyLog(undefined, undefined, 'async-failed'))
                async run(): Promise<void> {
                    throw err;
                }
            }

            await expect(new TestClass().run()).rejects.toThrow('async-fail');
            expect(error).toHaveBeenCalledWith('async-failed', err, 'TestClass::run');
        });
    });
});
