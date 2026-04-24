import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Histogram, register } from 'prom-client';
import { EMPTY, Observable, lastValueFrom, of } from 'rxjs';

import { histogramMetricTracking } from './histogram-metric-tracking';
import { HistogramMetric } from './histogram-metric.decorator';

const BUCKET_SMALL = 0.01;
const BUCKET_MEDIUM = 0.1;
const BUCKET_LARGE = 1;

const mockObserve = jest.fn();
jest.mock('prom-client', () => {
    const HistogramMock = jest.fn().mockImplementation(function (this: { observe: unknown }) {
        this.observe = mockObserve;
    });

    return {
        Histogram: HistogramMock,
        register: {
            getSingleMetric: jest.fn().mockReturnValue(undefined),
        },
    };
});

class TestClass {
    @HistogramMetric('test-metric')
    testMethod(): number {
        return 0;
    }

    @HistogramMetric('test-metric-with-config', { buckets: [1], help: 'test-help' })
    testMethodConfiguration(): number {
        return 0;
    }

    @HistogramMetric('test-metric')
    testMethodError(): number {
        throw new Error('test-error');
    }
}

describe(`HistogramMetric decorator`, () => {
    beforeEach(() => {
        histogramMetricTracking.reset(register);
    });

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
            name: 'test-metric-with-config',
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
        (Histogram as unknown as jest.Mock).mockImplementationOnce(function (this: { observe: unknown }) {
            this.observe = existingObserve;
        });
        const existingHistogram = new Histogram({ name: 'reuse-metric', help: 'reuse-metric' });
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

    it('ignores a non-Histogram metric of the same name and constructs a fresh histogram', () => {
        expect.assertions(3);

        mockObserve.mockClear();
        const counterObserve = jest.fn();
        const imposter = { observe: counterObserve };
        (Histogram as unknown as jest.Mock).mockClear();
        (register.getSingleMetric as jest.Mock).mockReturnValueOnce(imposter);

        class CounterImposterClass {
            @HistogramMetric('imposter-metric')
            run(): number {
                return 99;
            }
        }

        new CounterImposterClass().run();

        expect(Histogram).toHaveBeenCalledTimes(1);
        expect(counterObserve).not.toHaveBeenCalled();
        expect(mockObserve).toHaveBeenCalledTimes(1);
    });

    it('looks up an existing histogram in the supplied custom registry instead of the global register', () => {
        expect.assertions(3);

        const customObserve = jest.fn();
        (Histogram as unknown as jest.Mock).mockImplementationOnce(function (this: { observe: unknown }) {
            this.observe = customObserve;
        });
        const existingInCustom = new Histogram({ name: 'custom-reg-metric', help: 'custom-reg-metric' });
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

    it('reuses an existing histogram from later custom registries before constructing a new one', () => {
        expect.assertions(4);

        const laterObserve = jest.fn();
        (Histogram as unknown as jest.Mock).mockImplementationOnce(function (this: { observe: unknown }) {
            this.observe = laterObserve;
        });
        const laterHistogram = new Histogram({ name: 'multi-reg-metric', help: 'multi-reg-metric' });
        const firstRegistryGetSingleMetric = jest.fn().mockReturnValue(undefined);
        const secondRegistryGetSingleMetric = jest.fn().mockReturnValue(laterHistogram as unknown);
        const firstRegistry = { getSingleMetric: firstRegistryGetSingleMetric } as unknown as typeof register;
        const secondRegistry = { getSingleMetric: secondRegistryGetSingleMetric } as unknown as typeof register;
        (Histogram as unknown as jest.Mock).mockClear();

        class MultiRegistryClass {
            @HistogramMetric('multi-reg-metric', {
                help: 'multi-reg-metric',
                registers: [firstRegistry, secondRegistry],
            })
            run(): number {
                return 7;
            }
        }

        new MultiRegistryClass().run();

        expect(firstRegistryGetSingleMetric).toHaveBeenCalledWith('multi-reg-metric');
        expect(secondRegistryGetSingleMetric).toHaveBeenCalledWith('multi-reg-metric');
        expect(Histogram).not.toHaveBeenCalled();
        expect(laterObserve).toHaveBeenCalledTimes(1);
    });

    it('forwards labels from the configuration to prom-client observations', () => {
        expect.assertions(2);

        mockObserve.mockClear();

        class LabeledClass {
            @HistogramMetric<'tenant', [string]>('labeled-metric', {
                help: 'labeled-metric',
                labelNames: ['tenant'],
                labels: ([tenantId]: [string]) => ({ tenant: tenantId }),
            })
            run(_tenantId: string): number {
                return 1;
            }
        }

        new LabeledClass().run('acme');

        expect(mockObserve).toHaveBeenCalledTimes(1);
        expect((mockObserve as jest.Mock).mock.calls[0]?.[0]).toStrictEqual({ tenant: 'acme' });
    });

    it('observes without labels when no labels callback is supplied', () => {
        expect.assertions(2);

        mockObserve.mockClear();

        class UnlabeledClass {
            @HistogramMetric('unlabeled-metric')
            run(): number {
                return 1;
            }
        }

        new UnlabeledClass().run();

        expect(mockObserve).toHaveBeenCalledTimes(1);
        expect(typeof (mockObserve as jest.Mock).mock.calls[0]?.[0]).toBe('number');
    });

    describe('Observable and Promise duration semantics', () => {
        it('records exactly one observation after a Promise resolves (end-to-end duration)', async () => {
            expect.assertions(2);

            class AsyncSuccessClass {
                @HistogramMetric('promise-success-metric')
                async work(): Promise<number> {
                    await new Promise<void>(resolve => {
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
                    await new Promise<void>(resolve => {
                        setTimeout(resolve, 2);
                    });
                    throw new Error('async-boom');
                }
            }

            mockObserve.mockClear();
            await expect(new AsyncErrorClass().work()).rejects.toThrow('async-boom');

            expect(mockObserve).toHaveBeenCalledTimes(1);
        });

        it('records exactly one observation on Observable completion, regardless of emission count', async () => {
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

        it('records exactly one observation when the Observable completes without emitting', async () => {
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

    describe('config mismatch detection', () => {
        const applyFirst = (): void => {
            class First {
                @HistogramMetric('mismatch-metric', { help: 'h', buckets: [BUCKET_SMALL, BUCKET_MEDIUM, BUCKET_LARGE], labelNames: ['tenant'] })
                run(): number {
                    return 0;
                }
            }
            new First().run();
        };

        it('allows re-registration with IDENTICAL buckets and labelNames', () => {
            expect.hasAssertions();
            applyFirst();

            expect(() => {
                class Second {
                    @HistogramMetric('mismatch-metric', { help: 'h', buckets: [BUCKET_SMALL, BUCKET_MEDIUM, BUCKET_LARGE], labelNames: ['tenant'] })
                    run(): number {
                        return 0;
                    }
                }

                return new Second().run();
            }).not.toThrow();
        });

        it('allows re-registration with labelNames in a different order (set equality)', () => {
            expect.hasAssertions();
            class SetOrderFirst {
                @HistogramMetric('set-order-metric', { help: 'h', labelNames: ['a', 'b'] })
                run(): number {
                    return 0;
                }
            }
            new SetOrderFirst().run();

            expect(() => {
                class SetOrderSecond {
                    @HistogramMetric('set-order-metric', { help: 'h', labelNames: ['b', 'a'] })
                    run(): number {
                        return 0;
                    }
                }

                return new SetOrderSecond().run();
            }).not.toThrow();
        });

        it('throws on re-registration with DIFFERENT buckets', () => {
            expect.hasAssertions();
            applyFirst();

            expect(() => {
                class Second {
                    @HistogramMetric('mismatch-metric', { help: 'h', buckets: [0.5, 1], labelNames: ['tenant'] })
                    run(): number {
                        return 0;
                    }
                }

                return new Second().run();
            }).toThrow(/already registered with different buckets\/labelNames/);
        });

        it('throws on re-registration with DIFFERENT labelNames (different set)', () => {
            expect.hasAssertions();
            applyFirst();

            expect(() => {
                class Second {
                    @HistogramMetric('mismatch-metric', { help: 'h', buckets: [BUCKET_SMALL, BUCKET_MEDIUM, BUCKET_LARGE], labelNames: ['tenant', 'region'] })
                    run(): number {
                        return 0;
                    }
                }

                return new Second().run();
            }).toThrow(/already registered with different buckets\/labelNames/);
        });

        it('treats buckets: undefined vs buckets: [...] as different', () => {
            expect.hasAssertions();
            class NoBuckets {
                @HistogramMetric('undef-vs-empty')
                run(): number {
                    return 0;
                }
            }
            new NoBuckets().run();

            expect(() => {
                class WithBuckets {
                    @HistogramMetric('undef-vs-empty', { help: 'h', buckets: [0.5] })
                    run(): number {
                        return 0;
                    }
                }

                return new WithBuckets().run();
            }).toThrow(/already registered with different/);
        });

        it('does not conflate two different metric names', () => {
            expect.hasAssertions();
            class MetricOne {
                @HistogramMetric('name-a', { help: 'h', buckets: [1] })
                run(): number {
                    return 0;
                }
            }
            new MetricOne().run();

            expect(() => {
                class MetricTwo {
                    @HistogramMetric('name-b', { help: 'h', buckets: [2] })
                    run(): number {
                        return 0;
                    }
                }

                return new MetricTwo().run();
            }).not.toThrow();
        });

        it('histogramMetricTracking.reset(register) clears state so re-registration with different buckets succeeds', () => {
            expect.hasAssertions();
            applyFirst();

            histogramMetricTracking.reset(register);

            expect(() => {
                class AfterReset {
                    @HistogramMetric('mismatch-metric', { help: 'h', buckets: [0.5, 1] })
                    run(): number {
                        return 0;
                    }
                }

                return new AfterReset().run();
            }).not.toThrow();
        });

        it('error message includes previous and requested configs plus the metric name', () => {
            expect.hasAssertions();
            applyFirst();

            expect(() => {
                class Second {
                    @HistogramMetric('mismatch-metric', { help: 'h', buckets: [0.5] })
                    run(): number {
                        return 0;
                    }
                }

                return new Second().run();
            }).toThrow(/mismatch-metric.*Existing.*Requested/s);
        });

        it('treats labelNames: undefined vs labelNames: [...] as different', () => {
            expect.hasAssertions();
            class NoLabels {
                @HistogramMetric('labels-undef-vs-set')
                run(): number {
                    return 0;
                }
            }
            new NoLabels().run();

            expect(() => {
                class WithLabels {
                    @HistogramMetric('labels-undef-vs-set', { help: 'h', labelNames: ['tenant'] })
                    run(): number {
                        return 0;
                    }
                }

                return new WithLabels().run();
            }).toThrow(/already registered with different/);
        });

        it('distinguishes labelNames with different duplicate counts', () => {
            expect.hasAssertions();
            class DupFirst {
                @HistogramMetric('dup-count-metric', { help: 'h', labelNames: ['x', 'x'] })
                run(): number {
                    return 0;
                }
            }
            new DupFirst().run();

            expect(() => {
                class DupSecond {
                    @HistogramMetric('dup-count-metric', { help: 'h', labelNames: ['x', 'y'] })
                    run(): number {
                        return 0;
                    }
                }

                return new DupSecond().run();
            }).toThrow(/already registered with different/);
        });

        it('on IDENTICAL re-registration where getSingleMetric returns the histogram, reuses without re-tracking', () => {
            expect.hasAssertions();

            class First {
                @HistogramMetric('reuse-tracked-metric', { help: 'h', buckets: [0.5] })
                run(): number {
                    return 0;
                }
            }
            new First().run();

            const preExisting = jest.fn();
            (Histogram as unknown as jest.Mock).mockImplementationOnce(function (this: { observe: unknown }) {
                this.observe = preExisting;
            });
            const recognizedInstance = new Histogram({ name: 'reuse-tracked-metric', help: 'h' });
            (Histogram as unknown as jest.Mock).mockClear();
            (register.getSingleMetric as jest.Mock).mockReturnValueOnce(recognizedInstance);

            class Second {
                @HistogramMetric('reuse-tracked-metric', { help: 'h', buckets: [0.5] })
                run(): number {
                    return 0;
                }
            }
            new Second().run();

            expect(Histogram).not.toHaveBeenCalled();
            expect(preExisting).toHaveBeenCalledTimes(1);
        });

        it('adopts a pre-registered Histogram on first sight and records its config in tracking', () => {
            expect.hasAssertions();

            const preExisting = jest.fn();
            (Histogram as unknown as jest.Mock).mockImplementationOnce(function (this: { observe: unknown }) {
                this.observe = preExisting;
            });
            const preRegistered = new Histogram({ name: 'adopt-metric', help: 'pre' });
            (Histogram as unknown as jest.Mock).mockClear();
            (register.getSingleMetric as jest.Mock).mockReturnValueOnce(preRegistered);

            class Adopter {
                @HistogramMetric('adopt-metric', { help: 'h', buckets: [1] })
                run(): number {
                    return 0;
                }
            }
            new Adopter().run();

            expect(Histogram).not.toHaveBeenCalled();
            expect(preExisting).toHaveBeenCalledTimes(1);
        });
    });
});
