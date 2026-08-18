import { useContext } from 'react';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeaderScrollContext } from '../../context/collapsible-header-scroll.context';

import type { CollapsibleHeaderScroll } from '../../interface/collapsible-header-scroll.interface';

/**
 * Returns the provider-owned scroll wiring for attaching a scrollable to a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#usecollapsibleheaderscroll
 */
export const useCollapsibleHeaderScroll = (): CollapsibleHeaderScroll =>
    getDefined(useContext(CollapsibleHeaderScrollContext), () => {
        throw new Error('useCollapsibleHeaderScroll requires a CollapsibleHeaderProvider ancestor');
    });
