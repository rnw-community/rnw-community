import { type Observable, concatMap, defer, finalize, from } from 'rxjs';

import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle-interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';

const releaseSilently = (handle: LockHandleInterface): void => {
    void Promise.resolve(handle.release()).catch(() => void 0);
};

const invokeAndWire = (fn: () => Observable<unknown>, handle: LockHandleInterface): Observable<unknown> => {
    let result: Observable<unknown>;
    try {
        result = fn();
    } catch (err: unknown) {
        releaseSilently(handle);
        throw err;
    }
    return result.pipe(finalize(() => releaseSilently(handle)));
};

export const runWithLock$ = (
    store: LockStoreInterface,
    key: string,
    mode: LockModeType,
    options: AcquireOptionsInterface,
    fn: () => Observable<unknown>
    // eslint-disable-next-line @typescript-eslint/max-params
): Observable<unknown> =>
    defer(() =>
        from(store.acquire(key, mode, options)).pipe(concatMap((handle) => invokeAndWire(fn, handle)))
    );
