import type { InterceptorInterface } from './interceptor.interface';
import type { ResourceObservableInterface } from './resource-observable.interface';
import type { ResultStrategyInterface } from './result-strategy.interface';

export interface CreateObservableInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly interceptor: InterceptorInterface<TArgs, TResult>;
    readonly strategies?: readonly ResultStrategyInterface[];
    readonly resource$?: ResourceObservableInterface<TArgs>;
}
