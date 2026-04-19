import type { InterceptorInterface } from '../../type/interceptor.interface';
import type { ResultStrategyInterface } from '../../type/result-strategy.interface';

export interface CreateLegacyInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly interceptor: InterceptorInterface<TArgs, TResult>;
    readonly strategies?: readonly ResultStrategyInterface[];
}
