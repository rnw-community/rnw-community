import { Observable, concatMap, finalize, from } from 'rxjs';

import { emptyFn } from '@rnw-community/shared';

import { bridgeSignal } from '../bridge-signal/bridge-signal';
import { resolveLockKey } from '../resolve-lock-key/resolve-lock-key';

import type { LockHandleInterface } from '../../interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store.interface';
import type { LockArgumentType } from '../../type/lock-argument.type';
import type { LockModeType } from '../../type/lock-mode.type';
import type { InterceptorMiddleware } from '@rnw-community/decorators-core';

const acquireHandle$ = <TArgs extends readonly unknown[]>(
    store: LockStoreInterface,
    mode: LockModeType,
    arg: LockArgumentType<TArgs>,
    args: TArgs
): Observable<LockHandleInterface> =>
    new Observable<LockHandleInterface>((subscriber) => {
        const { key, options } = resolveLockKey(arg, args);
        const controller = new AbortController();
        let acquired = false;

        const onExternalAbort = (): void => {
            controller.abort();
            if (!subscriber.closed) {
                subscriber.error(new DOMException('The operation was aborted.', 'AbortError'));
            }
        };
        const releaseBridge = bridgeSignal(options.signal, onExternalAbort);

        void store
            .acquire(key, mode, { ...options, signal: controller.signal })
            .then((handle) => {
                if (subscriber.closed) {
                    void Promise.resolve(handle.release()).catch(emptyFn);

                    return null;
                }
                acquired = true;
                subscriber.next(handle);
                subscriber.complete();

                return null;
            })
            .catch((err: unknown) => {
                if (!subscriber.closed) {
                    subscriber.error(err);
                }
            });

        return () => {
            releaseBridge();
            if (!acquired) {
                controller.abort();
            }
        };
    });

export const createLockMiddleware$ = <TArgs extends readonly unknown[]>(
    store: LockStoreInterface,
    mode: LockModeType,
    arg: LockArgumentType<TArgs>
): InterceptorMiddleware<TArgs, Observable<unknown>> => ({
    invoke: (context, next) =>
        acquireHandle$(store, mode, arg, context.args).pipe(
            concatMap((handle) =>
                from(Promise.resolve(next())).pipe(
                    concatMap((inner$) => inner$),
                    finalize(() => {
                        void Promise.resolve()
                            .then(() => handle.release())
                            .catch(emptyFn);
                    })
                )
            )
        ),
});
