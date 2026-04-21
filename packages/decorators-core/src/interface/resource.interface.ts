import type { ExecutionContextInterface } from './execution-context.interface';
import type { ResourceHandleInterface } from './resource-handle.interface';

export interface ResourceInterface<TArgs extends readonly unknown[] = readonly unknown[]> {
    readonly acquire: (context: ExecutionContextInterface<TArgs>) => Promise<ResourceHandleInterface>;
}
