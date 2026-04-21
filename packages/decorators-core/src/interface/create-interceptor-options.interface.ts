import type { InterceptorMiddleware } from './interceptor-middleware.interface';

export interface CreateInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly middlewares: readonly InterceptorMiddleware<TArgs, TResult>[];
}
