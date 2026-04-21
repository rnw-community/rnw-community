import { Observable } from 'rxjs';

import { emptyFn } from '@rnw-community/shared';

import { bridgeSignal } from '../bridge-signal/bridge-signal';
import { resolveLockKey } from '../resolve-lock-key/resolve-lock-key';

import type { LockStoreInterface } from '../../interface/lock-store.interface';
import type { LockArgumentType } from '../../type/lock-argument.type';
import type { LockModeType } from '../../type/lock-mode.type';
import type { ResourceHandleInterface, ResourceObservableInterface } from '@rnw-community/decorators-core';

export const createLockResource$ = <TArgs extends readonly unknown[]>(
    store: LockStoreInterface,
    mode: LockModeType,
    arg: LockArgumentType<TArgs>
): ResourceObservableInterface<TArgs> => ({
    acquire$: (context) =>
        new Observable<ResourceHandleInterface>((subscriber) => {
            const { key, options } = resolveLockKey(arg, context.args);
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
                    subscriber.next({ release: () => handle.release() });
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
        }),
});
