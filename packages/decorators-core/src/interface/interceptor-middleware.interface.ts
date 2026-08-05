import type { ExecutionContextInterface } from './execution-context.interface.js';

export type InterceptorMiddleware<TArgs extends readonly unknown[] = readonly unknown[], TResult = unknown> = (
    context: ExecutionContextInterface<TArgs>,
    next: () => TResult
) => TResult;
