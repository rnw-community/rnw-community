import { Histogram, type HistogramConfiguration, register } from 'prom-client';

import { type AnyFn, type MethodDecoratorType, isDefined } from '@rnw-community/shared';

type DecoratorMethodType = (...args: unknown[]) => unknown;
type DecoratorDescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

interface HistogramMetricFn {
    <M extends string, K extends AnyFn>(
        metricName: string,
        configuration?: Omit<HistogramConfiguration<M>, 'name'>
    ): MethodDecoratorType<K>;

    <M extends string>(
        metricName: string,
        configuration?: Omit<HistogramConfiguration<M>, 'name'>
    ): MethodDecorator;
}

export const HistogramMetric: HistogramMetricFn =
    <M extends string>(
            metricName: string,
            configuration?: Omit<HistogramConfiguration<M>, 'name'>
        ): MethodDecorator =>
        (_target, _propertyKey, descriptor) => {
            let histogram = register.getSingleMetric(metricName) as Histogram<M> | undefined;

            if (!isDefined(histogram)) {
                histogram = new Histogram({
                    help: metricName,
                    ...configuration,
                    name: metricName,
                });
            }

            const typedDescriptor = descriptor as unknown as DecoratorDescriptorType;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const originalMethod = typedDescriptor.value!;

            // eslint-disable-next-line func-names
            typedDescriptor.value = function (...args: unknown[]): unknown {
                const endHistogram = histogram.startTimer();

                try {
                    return originalMethod.call(this, ...args);
                } finally {
                    endHistogram();
                }
            };

            return descriptor;
        };
