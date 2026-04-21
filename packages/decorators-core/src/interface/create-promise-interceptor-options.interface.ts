import type { InterceptorInterface } from './interceptor.interface';
import type { ResourceInterface } from './resource.interface';
import type { ResultStrategyInterface } from './result-strategy.interface';

export interface CreatePromiseInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly interceptor: InterceptorInterface<TArgs, TResult>;
    readonly strategies?: readonly ResultStrategyInterface[];
    readonly resource?: ResourceInterface<TArgs>;
}
