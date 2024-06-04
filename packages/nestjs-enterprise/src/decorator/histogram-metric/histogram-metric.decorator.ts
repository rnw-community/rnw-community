import { Histogram, type HistogramConfiguration } from 'prom-client';

import type { MethodDecoratorType } from '../../type/method-decorator.type';

export const HistogramMetric =
    <M extends string, TResult, TArgs extends unknown[] = unknown[]>(
        metricName: string,
        configuration?: Omit<HistogramConfiguration<M>, 'name'>
    ): MethodDecoratorType<TResult, TArgs> =>
    (_target, _propertyKey, descriptor) => {
        const histogram = new Histogram({
            help: metricName,
            ...configuration,
            name: metricName,
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalMethod = descriptor.value!;

        // eslint-disable-next-line max-statements,func-names
        descriptor.value = function (...args: TArgs) {
            const endHistogram = histogram.startTimer();

            try {
                return originalMethod.apply(this, args);
            } finally {
                endHistogram();
            }
        };

        return descriptor;
    };
