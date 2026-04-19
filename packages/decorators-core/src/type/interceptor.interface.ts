import type { ExecutionContextInterface } from './execution-context.interface';

export interface InterceptorInterface<TArgs extends readonly unknown[] = readonly unknown[], TResult = unknown> {
    readonly onEnter?: (context: ExecutionContextInterface<TArgs>) => void;
    readonly onSuccess?: (context: ExecutionContextInterface<TArgs>, result: TResult, durationMs: number) => void;
    readonly onError?: (context: ExecutionContextInterface<TArgs>, error: unknown, durationMs: number) => void;
}
