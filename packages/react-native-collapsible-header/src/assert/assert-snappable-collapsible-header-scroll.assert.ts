import { isDefined } from '@rnw-community/shared';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';

export const assertSnappableCollapsibleHeaderScroll = (snap: boolean, scrollY: CollapsibleHeaderProps['scrollY']) => {
    if (snap && isDefined(scrollY)) {
        throw new Error(
            'CollapsibleHeader snap scrolls the CollapsibleHeaderProvider scrollable, so it cannot combine with a scrollY prop'
        );
    }
};
