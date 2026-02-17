import { describe, expect, it, jest } from '@jest/globals';
import { Histogram } from 'prom-client';

import { HistogramMetric } from './histogram-metric.decorator';

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

    @HistogramMetric('test-metric')
    testGeneric<T>(arg: T): T {
        return arg;
    }

    @HistogramMetric('test-metric')
    testConstrainedGeneric<T extends { id: number }>(arg: T): T {
        return arg;
    }

    @HistogramMetric('test-metric')
    async testGenericPromise<T>(arg: T): Promise<T> {
        return await arg;
    }
}

const mockEndTimer = jest.fn();
jest.mock('prom-client', () => ({
    Histogram: jest.fn().mockImplementation(() => ({
        startTimer: jest.fn().mockImplementation(() => mockEndTimer),
    })),
    register: {
        getSingleMetric: jest.fn().mockReturnValue(undefined),
    },
}));

describe(`HistogramMetric decorator`, () => {
    it('should create and run histogram metric', () => {
        expect.assertions(2);

        const testClass = new TestClass();
        testClass.testMethod();

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-metric',
        });
        expect(mockEndTimer).toHaveBeenCalledWith();
    });

    it('should create and run histogram metric with configuration', () => {
        expect.assertions(2);

        const testClass = new TestClass();
        testClass.testMethodConfiguration();

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-help',
            buckets: [1],
        });
        expect(mockEndTimer).toHaveBeenCalledWith();
    });

    it('should create and run histogram metric with method error', () => {
        expect.assertions(3);

        const testClass = new TestClass();

        expect(() => testClass.testMethodError()).toThrow('test-error');

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-metric',
        });
        expect(mockEndTimer).toHaveBeenCalledWith();
    });

    it('should support generic methods', () => {
        expect.assertions(2);

        const testClass = new TestClass();
        const result = testClass.testGeneric('test');

        expect(result).toBe('test');
        expect(mockEndTimer).toHaveBeenCalledWith();
    });

    it('should support constrained generic methods', () => {
        expect.assertions(2);

        const testClass = new TestClass();
        const result = testClass.testConstrainedGeneric({ id: 42 });

        expect(result).toStrictEqual({ id: 42 });
        expect(mockEndTimer).toHaveBeenCalledWith();
    });

    it('should support generic promise methods', async () => {
        expect.assertions(2);

        const testClass = new TestClass();
        const result = await testClass.testGenericPromise('test');

        expect(result).toBe('test');
        expect(mockEndTimer).toHaveBeenCalledWith();
    });
});
