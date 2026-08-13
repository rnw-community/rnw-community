import { useContext } from 'react';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeaderProgressContext } from '../../context/collapsible-header-progress.context';

import type { SharedValue } from 'react-native-reanimated';

/**
 * Returns the collapse progress shared value, `0` expanded through `1` collapsed, for slot-driven animations.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#usecollapsibleheaderprogress
 */
export const useCollapsibleHeaderProgress = (): SharedValue<number> =>
    getDefined(useContext(CollapsibleHeaderProgressContext), () => {
        throw new Error('useCollapsibleHeaderProgress requires a CollapsibleHeader ancestor');
    });
