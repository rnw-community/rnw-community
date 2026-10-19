import type { ExecutionContextInterface } from './execution-context.interface';

/**
 * The function a method decorator runs around each call, receiving the execution context and a `next` that invokes the original method.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/decorators-core/readme.md#interceptormiddlewaretargs-tresult
 */
export type InterceptorMiddleware<TArgs extends readonly unknown[] = readonly unknown[], TResult = unknown> = (
    context: ExecutionContextInterface<TArgs>,
    next: () => TResult
) => TResult;
