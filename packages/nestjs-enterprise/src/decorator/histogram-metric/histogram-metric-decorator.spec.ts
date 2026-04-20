import { describe, expect, it, jest } from '@jest/globals';
import { Histogram, register } from 'prom-client';
import { EMPTY, Observable, lastValueFrom, of } from 'rxjs';

import { HistogramMetric } from './histogram-metric.decorator';

const mockObserve = jest.fn();
jest.mock('prom-client', () => ({
    Histogram: jest.fn().mockImplementation(() => ({
        observe: mockObserve,
    })),
    register: {
        getSingleMetric: jest.fn().mockReturnValue(undefined),
    },
}));

class TestClass {
    @HistogramMetric('test-metric')
    testMethod(): number {
        return 0;
    }

    @HistogramMetric('test-metric', { buckets: [1], help: 'test-help' })
    testMethodConfiguration(): number {
        return 0;
    }

    @HistogramMetric('test-metric')
    testMethodError(): number {
        throw new Error('test-error');
    }
}

describe(`HistogramMetric decorator`, () => {
    it('should create a histogram and record the observation on success', () => {
        expect.assertions(3);

        mockObserve.mockClear();
        const testClass = new TestClass();
        testClass.testMethod();

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-metric',
        });
        expect(mockObserve).toHaveBeenCalledTimes(1);
        expect(typeof (mockObserve as jest.Mock).mock.calls[0]?.[0]).toBe('number');
    });

    it('should create a histogram honouring the supplied configuration', () => {
        expect.assertions(2);

        mockObserve.mockClear();
        const testClass = new TestClass();
        testClass.testMethodConfiguration();

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-help',
            buckets: [1],
        });
        expect(mockObserve).toHaveBeenCalledTimes(1);
    });

    it('records the observation on error paths and rethrows the original error', () => {
        expect.assertions(3);

        mockObserve.mockClear();
        const testClass = new TestClass();

        expect(() => testClass.testMethodError()).toThrow('test-error');
        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-metric',
        });
        expect(mockObserve).toHaveBeenCalledTimes(1);
    });

    it('reuses an already-registered histogram without constructing a new one', () => {
        expect.assertions(2);

        const existingObserve = jest.fn();
        const existingHistogram = { observe: existingObserve };
        (Histogram as unknown as jest.Mock).mockClear();
        (register.getSingleMetric as jest.Mock).mockReturnValueOnce(existingHistogram);

        class ReuseTestClass {
            @HistogramMetric('reuse-metric')
            run(): number {
                return 42;
            }
        }

        new ReuseTestClass().run();

        expect(Histogram).not.toHaveBeenCalled();
        expect(existingObserve).toHaveBeenCalledTimes(1);
    });

    it('looks up an existing histogram in the supplied custom registry instead of the global register', () => {
        expect.assertions(3);

        const customObserve = jest.fn();
        const existingInCustom = { observe: customObserve };
        const getSingleMetricSpy = jest.fn((_name: string) => existingInCustom as unknown);
        const customRegistry = { getSingleMetric: getSingleMetricSpy } as unknown as typeof register;
        (Histogram as unknown as jest.Mock).mockClear();

        class CustomRegistryClass {
            @HistogramMetric('custom-reg-metric', { help: 'custom-reg-metric', registers: [customRegistry] })
            run(): number {
                return 7;
            }
        }

        new CustomRegistryClass().run();

        expect(getSingleMetricSpy).toHaveBeenCalledWith('custom-reg-metric');
        expect(Histogram).not.toHaveBeenCalled();
        expect(customObserve).toHaveBeenCalledTimes(1);
    });

    describe('Observable and Promise duration semantics', () => {
        it('records exactly one observation after a Promise resolves (end-to-end duration)', async () => {
            expect.assertions(2);

            class AsyncSuccessClass {
                @HistogramMetric('promise-success-metric')
                async work(): Promise<number> {
                    await new Promise<void>((resolve) => {
                        setTimeout(resolve, 2);
                    });
                    
return 1;
                }
            }

            mockObserve.mockClear();
            await new AsyncSuccessClass().work();

            expect(mockObserve).toHaveBeenCalledTimes(1);
            expect(typeof (mockObserve as jest.Mock).mock.calls[0]?.[0]).toBe('number');
        });

        it('records exactly one observation after a Promise rejects (duration still emitted)', async () => {
            expect.assertions(2);

            class AsyncErrorClass {
                @HistogramMetric('promise-error-metric')
                async work(): Promise<number> {
                    await new Promise<void>((resolve) => {
                        setTimeout(resolve, 2);
                    });
                    throw new Error('async-boom');
                }
            }

            mockObserve.mockClear();
            await expect(new AsyncErrorClass().work()).rejects.toThrow('async-boom');

            expect(mockObserve).toHaveBeenCalledTimes(1);
        });

        it('Observable with multiple next values is not specially handled — exactly one sync observation, independent of emission count', async () => {
            expect.assertions(1);

            class MultiEmitClass {
                @HistogramMetric('observable-multi-metric')
                stream(): Observable<number> {
                    return of(1, 2, 3);
                }
            }

            mockObserve.mockClear();
            await lastValueFrom(new MultiEmitClass().stream());

            expect(mockObserve).toHaveBeenCalledTimes(1);
        });

        it('Observable that completes without emitting is not specially handled — exactly one sync observation', async () => {
            expect.assertions(1);

            class EmptyEmitClass {
                @HistogramMetric('observable-empty-metric')
                stream(): Observable<never> {
                    return EMPTY;
                }
            }

            mockObserve.mockClear();
            await lastValueFrom(new EmptyEmitClass().stream(), { defaultValue: undefined });

            expect(mockObserve).toHaveBeenCalledTimes(1);
        });
    });
});
