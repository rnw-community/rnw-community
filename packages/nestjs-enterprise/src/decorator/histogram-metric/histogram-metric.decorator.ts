import { Histogram, type HistogramConfiguration, register } from 'prom-client';

import { createLegacyInterceptor } from '@rnw-community/decorators-core';
import type { ExecutionContextInterface } from '@rnw-community/decorators-core';
import { observableStrategy } from '@rnw-community/decorators-rxjs';

import { type AnyFn, type MethodDecoratorType, isDefined } from '@rnw-community/shared';

type EndTimerFnType = ReturnType<Histogram['startTimer']>;

export const HistogramMetric =
    <M extends string, K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            metricName: string,
            configuration?: Omit<HistogramConfiguration<M>, 'name'>
        ): MethodDecoratorType<K> => {
        let histogram = register.getSingleMetric(metricName) as Histogram<M> | undefined;

        if (!isDefined(histogram)) {
            histogram = new Histogram({
                help: metricName,
                ...configuration,
                name: metricName,
            });
        }

        // Per-invocation endTimer storage keyed by the ExecutionContext object the engine
        // produces once per call. This preserves prom-client's native startTimer/endTimer
        // idiom (so register/Histogram/endTimer mock expectations stay intact) while the
        // decorators-core engine drives the enter/success/error lifecycle.
        const timers = new WeakMap<ExecutionContextInterface<TArgs>, EndTimerFnType>();

        // The timer MUST have been set by onEnter before onSuccess/onError fire for the
        // same ExecutionContext — the decorators-core engine guarantees this ordering.
        // Using optional-call + unconditional delete removes the "missing entry" branch
        // entirely while staying safe against a hypothetical contract violation.
        const endTimer = (context: ExecutionContextInterface<TArgs>): void => {
            timers.get(context)?.();
            timers.delete(context);
        };

        return createLegacyInterceptor<TArgs, TResult>({
            interceptor: {
                onEnter: (context) => {
                    timers.set(context, histogram.startTimer());
                },
                onSuccess: (context) => {
                    endTimer(context);
                },
                onError: (context) => {
                    endTimer(context);
                },
            },
            strategies: [observableStrategy],
        }) as unknown as MethodDecoratorType<K>;
    };
