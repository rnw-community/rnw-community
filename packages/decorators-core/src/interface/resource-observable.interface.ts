
import type { ExecutionContextInterface } from './execution-context.interface';
import type { ResourceHandleInterface } from './resource-handle.interface';
import type { Observable } from 'rxjs';

export interface ResourceObservableInterface<TArgs extends readonly unknown[] = readonly unknown[]> {
    readonly acquire$: (context: ExecutionContextInterface<TArgs>) => Observable<ResourceHandleInterface>;
}
