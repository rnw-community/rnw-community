import { describe, expect, it, jest } from '@jest/globals';
import { Histogram, register } from 'prom-client';

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
});
