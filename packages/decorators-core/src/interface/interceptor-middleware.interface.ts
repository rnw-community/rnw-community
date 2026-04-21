import type { ExecutionContextInterface } from './execution-context.interface';

export interface InterceptorMiddleware<TArgs extends readonly unknown[] = readonly unknown[], TResult = unknown> {
    readonly invoke: (context: ExecutionContextInterface<TArgs>, next: () => TResult) => TResult;
}
