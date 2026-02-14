import { Histogram, type HistogramConfiguration, register } from 'prom-client';

import { type AnyFn, MethodDecoratorType , isDefined } from '@rnw-community/shared';


export const HistogramMetric =
    <M extends string, K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            metricName: string,
            configuration?: Omit<HistogramConfiguration<M>, 'name'>
        ): MethodDecoratorType<K> =>
        (_target, _propertyKey, descriptor) => {
            let histogram = register.getSingleMetric(metricName) as Histogram<M> | undefined;

            if (!isDefined(histogram)) {
                histogram = new Histogram({
                    help: metricName,
                    ...configuration,
                    name: metricName,
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const originalMethod = descriptor.value!;

            // eslint-disable-next-line func-names
            descriptor.value = function (...args: TArgs): TResult {
                const endHistogram = histogram.startTimer();

                try {
                    // @ts-expect-error We need this to handle generic methods correctly
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return originalMethod.apply(this, args);
                } finally {
                    endHistogram();
                }
            } as K;

            return descriptor;
        };
