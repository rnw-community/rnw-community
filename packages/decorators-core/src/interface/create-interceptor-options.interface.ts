import type { InterceptorMiddleware } from './interceptor-middleware.interface.js';

export interface CreateInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    readonly middleware: InterceptorMiddleware<TArgs, TResult>;
}
