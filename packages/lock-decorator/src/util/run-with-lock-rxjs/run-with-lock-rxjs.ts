import { Observable, type Subscriber, Subscription, finalize, isObservable } from 'rxjs';

import { type EmptyFn, emptyFn, isDefined } from '@rnw-community/shared';

import type { AcquireOptionsInterface } from '../../interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode.type';

const releaseSilently = (handle: LockHandleInterface): void => {
    void Promise.resolve(handle.release()).catch(emptyFn);
};

const bridgeSignal = (external: AbortSignal | undefined, controller: AbortController): EmptyFn => {
    if (!isDefined(external)) {
        return emptyFn;
    }
    if (external.aborted) {
        controller.abort();

        return emptyFn;
    }
    const forward = (): void => void controller.abort();
    external.addEventListener('abort', forward, { once: true });

    return () => void external.removeEventListener('abort', forward);
};

const invokeAndWire = (
    fn: () => Observable<unknown>,
    handle: LockHandleInterface,
    subscriber: Subscriber<unknown>,
    innerSubscription: Subscription
): void => {
    let result$: Observable<unknown>;
    try {
        result$ = fn();
    } catch (err: unknown) {
        releaseSilently(handle);
        subscriber.error(err);

        return;
    }
    if (!isObservable(result$)) {
        releaseSilently(handle);
        subscriber.error(new Error('Locked method must return an Observable'));

        return;
    }
    innerSubscription.add(
        result$.pipe(finalize(() => void releaseSilently(handle))).subscribe(subscriber)
    );
};

interface OnHandleAcquiredArgs {
    readonly handle: LockHandleInterface;
    readonly cancelledRef: { readonly value: boolean };
    readonly fn: () => Observable<unknown>;
    readonly subscriber: Subscriber<unknown>;
    readonly innerSubscription: Subscription;
}

const onHandleAcquired = ({ handle, cancelledRef, fn, subscriber, innerSubscription }: OnHandleAcquiredArgs): void => {
    if (cancelledRef.value) {
        releaseSilently(handle);

        return;
    }
    invokeAndWire(fn, handle, subscriber, innerSubscription);
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
        const releaseBridge = bridgeSignal(options.signal, controller);

        const cancelledRef = { value: false };
        const innerSubscription = new Subscription();

        void store.acquire(key, mode, { ...options, signal: controller.signal })
            .then((handle) => {
                onHandleAcquired({ handle, cancelledRef, fn, subscriber, innerSubscription });

                return null;
            })
            .catch((err: unknown) => {
                if (!cancelledRef.value) {
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
