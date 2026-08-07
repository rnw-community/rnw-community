import React from 'react';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot.js';

import type { ReactNode } from 'react';

interface Props {
    readonly children?: ReactNode;
}

/**
 * Marks the direct leading-control slot of a compound collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheader
 */
export const CollapsibleHeaderLeading = ({ children }: Props): ReactNode => (
    <CollapsibleHeaderSlot>{children}</CollapsibleHeaderSlot>
);
