import { describe, expect, it, jest } from '@jest/globals';
import { Histogram } from 'prom-client';

import { HistogramMetric } from './histogram-metric.decorator';

class TestClass {
    @HistogramMetric('test-metric')
    testMethod(): number {
        return 0;
    }

    @HistogramMetric('test-metric', { buckets: [100], help: 'test-help' })
    testMethodConfiguration(): number {
        return 0;
    }

    @HistogramMetric('test-metric', { buckets: [100], help: 'test-help' })
    testMethodError(): number {
        throw new Error('test-error');
    }
}

const mockEndTimer = jest.fn();
jest.mock('prom-client', () => ({
    Histogram: jest.fn().mockImplementation(() => ({
        startTimer: jest.fn().mockImplementation(() => mockEndTimer),
    })),
}));

describe(`HistogramMetric decorator`, () => {
    it('should create and run histogram metric', () => {
        const testClass = new TestClass();
        testClass.testMethod();

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-metric',
        });
        expect(mockEndTimer).toHaveBeenCalled();
    });

    it('should create and run histogram metric with configuration', () => {
        const testClass = new TestClass();
        testClass.testMethodConfiguration();

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-helps',
            buckets: [100],
        });
        expect(mockEndTimer).toHaveBeenCalled();
    });

    it('should create and run histogram metric with method error', () => {
        const testClass = new TestClass();
        expect(() => testClass.testMethodError()).toThrow('test-error');

        expect(Histogram).toHaveBeenCalledWith({
            name: 'test-metric',
            help: 'test-metric',
        });
        expect(mockEndTimer).toHaveBeenCalled();
    });
});
