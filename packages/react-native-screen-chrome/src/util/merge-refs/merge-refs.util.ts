import { isDefined } from '@rnw-community/shared';

import type { Ref, RefCallback } from 'react';

type RefCleanup = ReturnType<RefCallback<unknown>>;

const detach = <T,>(ref: Ref<T> | undefined, cleanup: RefCleanup): void => {
    if (typeof cleanup === 'function') {
        cleanup();
    } else if (typeof ref === 'function') {
        ref(null);
    } else if (isDefined(ref)) {
        ref.current = null;
    }
};

/**
 * Fans one instance out to several refs, so a chrome scroll ref can be attached alongside consumer and local refs.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#mergerefs
 */
export const mergeRefs =
    <T,>(...refs: readonly (Ref<T> | undefined)[]): RefCallback<T> =>
    instance => {
        const cleanups = refs.map(ref => {
            if (typeof ref === 'function') {
                return ref(instance);
            }

            if (isDefined(ref)) {
                ref.current = instance;
            }

            return void 0;
        });

        return () => {
            refs.forEach((ref, index) => void detach(ref, cleanups[index]));
        };
    };
