import { buildContext } from '../build-context/build-context';
import { runInterception } from '../run-interception/run-interception';

import type { InterceptorInterface } from '../../type/interceptor-interface/interceptor.interface';
import type { ResultStrategyInterface } from '../../type/result-strategy-interface/result-strategy.interface';

export interface CreateInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly interceptor: InterceptorInterface<TArgs, TResult>;
    readonly strategies?: readonly ResultStrategyInterface[];
}

type Stage3ReplaceType<TArgs extends readonly unknown[], TResult> = (
    originalMethod: (this: unknown, ...args: TArgs) => TResult,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: ClassMethodDecoratorContext<any, (this: unknown, ...args: TArgs) => TResult>
) => (this: unknown, ...args: TArgs) => TResult;

export const createInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateInterceptorOptionsInterface<TArgs, TResult>
): Stage3ReplaceType<TArgs, TResult> => {
    const strategies = options.strategies ?? [];

    return (originalMethod, context) => {
        const methodName = typeof context.name === 'string' ? context.name : String(context.name);

        return function interceptedMethod(this: unknown, ...args: TArgs): TResult {
            const execContext = buildContext(this, 'Object', methodName, args);

            return runInterception(options.interceptor, strategies, execContext, () =>
                (originalMethod as unknown as (this: unknown, ...methodArgs: unknown[]) => TResult).apply(this, [...args])
            );
        };
    };
};
