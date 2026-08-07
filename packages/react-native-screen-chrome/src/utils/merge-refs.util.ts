import { emptyFn, isDefined } from '@rnw-community/shared';

import type { Ref, RefCallback } from 'react';

/**
 * Merges callback and object refs into one callback for components with provider-owned and consumer-owned refs.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#mergerefs
 */
export const mergeRefs =
    <TRef>(...refs: readonly (Ref<TRef> | undefined)[]): RefCallback<TRef> =>
    (instance: TRef | null) => {
        const cleanups: (() => void)[] = [];

        refs.forEach(ref => {
            if (!isDefined(ref)) {
                return;
            }

            if (typeof ref === 'function') {
                const cleanup = ref(instance);

                if (typeof cleanup === 'function') {
                    cleanups.push(cleanup);
                }

                return;
            }

            ref.current = instance;
        });

        if (cleanups.length === 0) {
            return emptyFn;
        }

        return () => {
            cleanups.forEach(cleanup => {
                cleanup();
            });
        };
    };
