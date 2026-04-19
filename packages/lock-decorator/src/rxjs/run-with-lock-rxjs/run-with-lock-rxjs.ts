import { Observable, Subscription, finalize } from 'rxjs';

import { isDefined } from '@rnw-community/shared';

import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle-interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';

const releaseSilently = (handle: LockHandleInterface): void => {
    void Promise.resolve(handle.release()).catch(() => void 0);
};

const bridgeSignal = (external: AbortSignal | undefined, controller: AbortController): void => {
    if (!isDefined(external)) {
        return;
    }
    if (external.aborted) {
        controller.abort();
        return;
    }
    external.addEventListener('abort', () => controller.abort(), { once: true });
};

export const runWithLock$ = (
    store: LockStoreInterface,
    key: string,
    mode: LockModeType,
    options: AcquireOptionsInterface,
    fn: () => Observable<unknown>
    // eslint-disable-next-line @typescript-eslint/max-params
): Observable<unknown> =>
    new Observable<unknown>((subscriber) => {
        const controller = new AbortController();
        bridgeSignal(options.signal, controller);

        let cancelled = false;
        const innerSubscription = new Subscription();

        void store.acquire(key, mode, { ...options, signal: controller.signal }).then(
            (handle) => {
                if (cancelled) {
                    releaseSilently(handle);
                    return;
                }
                let result$: Observable<unknown>;
                try {
                    result$ = fn();
                } catch (err: unknown) {
                    releaseSilently(handle);
                    subscriber.error(err);
                    return;
                }
                innerSubscription.add(
                    result$.pipe(finalize(() => releaseSilently(handle))).subscribe(subscriber)
                );
            },
            (err: unknown) => {
                if (!cancelled) {
                    subscriber.error(err);
                }
            }
        );

        return () => {
            cancelled = true;
            controller.abort();
            innerSubscription.unsubscribe();
        };
    });
