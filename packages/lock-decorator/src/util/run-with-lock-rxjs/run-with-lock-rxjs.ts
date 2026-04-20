import { Observable, Subscription, finalize, isObservable } from 'rxjs';

import { type EmptyFn, emptyFn, isDefined } from '@rnw-community/shared';

import type { AcquireOptionsInterface } from '../../interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode.type';

const releaseSilently = (handle: LockHandleInterface): void => {
    void Promise.resolve(handle.release()).catch(emptyFn);
};

const bridgeSignal = (external: AbortSignal | undefined, onAbort: () => void): EmptyFn => {
    if (!isDefined(external)) {
        return emptyFn;
    }
    if (external.aborted) {
        onAbort();

        return emptyFn;
    }
    external.addEventListener('abort', onAbort, { once: true });

    return () => void external.removeEventListener('abort', onAbort);
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
        const cancelledRef = { value: false };
        const innerSubscription = new Subscription();
        let externallyAborted = false;

        const onExternalAbort = (): void => {
            externallyAborted = true;
            controller.abort();
            subscriber.error(new DOMException('The operation was aborted.', 'AbortError'));
        };

        const releaseBridge = bridgeSignal(options.signal, onExternalAbort);

        void store
            .acquire(key, mode, { ...options, signal: controller.signal })
            // eslint-disable-next-line max-statements
            .then((handle) => {
                if (cancelledRef.value || externallyAborted) {
                    releaseSilently(handle);

                    return null;
                }
                let result$: Observable<unknown>;
                try {
                    result$ = fn();
                } catch (err: unknown) {
                    releaseSilently(handle);
                    subscriber.error(err);

                    return null;
                }
                if (!isObservable(result$)) {
                    releaseSilently(handle);
                    subscriber.error(new Error('Locked method must return an Observable'));

                    return null;
                }
                innerSubscription.add(
                    result$.pipe(finalize(() => void releaseSilently(handle))).subscribe(subscriber)
                );

                return null;
            })
            .catch((err: unknown) => {
                if (!cancelledRef.value && !externallyAborted) {
                    subscriber.error(err);
                }
            });

        return () => {
            cancelledRef.value = true;
            controller.abort();
            releaseBridge();
            innerSubscription.unsubscribe();
        };
    });
