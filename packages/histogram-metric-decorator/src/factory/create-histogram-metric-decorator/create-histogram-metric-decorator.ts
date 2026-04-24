import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import { createInterceptor } from '@rnw-community/decorators-core';
import { isPromise } from '@rnw-community/shared';

import type { CreateHistogramMetricOptionsInterface } from '../../interface/create-histogram-metric-options.interface';
import type { HistogramOptionsInterface } from '../../interface/histogram-options.interface';
import type { InterceptorMiddleware } from '@rnw-community/decorators-core';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

const resolveLabelsSafely = <TArgs extends readonly unknown[]>(
    labelsFn: HistogramOptionsInterface<TArgs>['labels'],
    args: TArgs,
    onLabelsError: CreateHistogramMetricOptionsInterface['onLabelsError']
): Readonly<Record<string, string>> | undefined => {
    if (labelsFn === void 0) {
        return void 0;
    }
    try {
        return labelsFn(args);
    } catch (err) {
        try {
            onLabelsError?.(err, args);
        } catch {
            void 0;
        }

        return void 0;
    }
};

const buildHistogramMiddleware = <TArgs extends readonly unknown[]>(
    options: CreateHistogramMetricOptionsInterface,
    config?: HistogramOptionsInterface<TArgs>
): InterceptorMiddleware<TArgs> => {
    // eslint-disable-next-line max-statements -- single cohesive observe-on-terminal path across sync/Promise/Observable shapes
    const middleware: InterceptorMiddleware<TArgs> = (context, next) => {
        const start = performance.now();
        const observeOnTerminal = (): void => {
            options.transport.observe(
                config?.name ?? `${context.className}_${context.methodName}_duration_ms`,
                performance.now() - start,
                resolveLabelsSafely(config?.labels, context.args, options.onLabelsError)
            );
        };

        let raw: unknown;
        try {
            raw = next();
        } catch (err) {
            observeOnTerminal();
            throw err;
        }

        if (isPromise(raw)) {
            return Promise.resolve(raw).then(
                (value) => {
                    observeOnTerminal();

                    return value;
                },
                (err: unknown) => {
                    observeOnTerminal();
                    throw err;
                }
            );
        }
        if (isObservable(raw)) {
            return (raw as unknown as Observable<unknown>).pipe(
                tap({ complete: observeOnTerminal }),
                catchError((err: unknown) => {
                    observeOnTerminal();

                    return throwError(() => err);
                })
            );
        }
        observeOnTerminal();

        return raw;
    };

    return middleware;
};

export const createHistogramMetricDecorator =
    (options: CreateHistogramMetricOptionsInterface) =>
    <K extends AnyFn, TArgs extends Parameters<K> = Parameters<K>>(
        config?: HistogramOptionsInterface<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, unknown>({
            middleware: buildHistogramMiddleware<TArgs>(options, config),
        }) as unknown as MethodDecoratorType<K>;
