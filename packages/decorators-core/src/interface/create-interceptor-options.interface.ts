import type { InterceptorInterface } from './interceptor.interface';
import type { ResultStrategyInterface } from './result-strategy.interface';

export interface CreateInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly interceptor: InterceptorInterface<TArgs, TResult>;
    readonly strategies?: readonly ResultStrategyInterface[];
}
