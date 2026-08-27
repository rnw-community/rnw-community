import { isDefined } from '@rnw-community/shared';

import type { Ref, RefCallback } from 'react';

/**
 * Fans one instance out to several refs, so a chrome scroll ref can be attached alongside consumer and local refs.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#mergerefs
 */
export const mergeRefs =
    <T,>(...refs: readonly Ref<T>[]): RefCallback<T> =>
    instance => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(instance);
            } else if (isDefined(ref)) {
                ref.current = instance;
            }
        });
    };
