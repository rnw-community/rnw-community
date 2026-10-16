import type { InterceptorMiddleware } from './interceptor-middleware.interface';

/**
 * The options accepted by `createInterceptor`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/decorators-core/readme.md#createinterceptoroptionsinterfacetargs-tresult
 */
export interface CreateInterceptorOptionsInterface<TArgs extends readonly unknown[], TResult> {
    /** The middleware invoked exactly once per decorated-method call. */
    readonly middleware: InterceptorMiddleware<TArgs, TResult>;
}
