import { Children, isValidElement } from 'react';

import { isDefined } from '@rnw-community/shared';

import { getCollapsibleHeaderSlotKind } from '../get-collapsible-header-slot-kind/get-collapsible-header-slot-kind.util';

import type { CollapsibleHeaderSlotsInterface } from '../../interface/collapsible-header-slots.interface';
import type { ReactElement, ReactNode } from 'react';

interface SlotProps {
    readonly children?: ReactNode;
}

interface DiscoveredSlots {
    readonly leading: ReactElement | undefined;
    readonly titleSlot: ReactElement<SlotProps> | undefined;
    readonly trailing: ReactElement | undefined;
}

const NO_DISCOVERED_SLOTS: DiscoveredSlots = { leading: void 0, titleSlot: void 0, trailing: void 0 };

const takeVacantSlot = <T extends ReactElement>(current: T | undefined, next: T, description: string): T => {
    if (isDefined(current)) {
        throw new TypeError(`CollapsibleHeader accepts at most one ${description}`);
    }

    return next;
};

const assignSlot = (slots: DiscoveredSlots, child: ReactNode): DiscoveredSlots => {
    if (!isValidElement<SlotProps>(child)) {
        throw new TypeError('CollapsibleHeader direct children must be CollapsibleHeaderSlot or CollapsibleHeaderTitleSlot');
    }

    const kind = getCollapsibleHeaderSlotKind(child);

    if (!isDefined(kind)) {
        throw new TypeError('CollapsibleHeader direct children must be CollapsibleHeaderSlot or CollapsibleHeaderTitleSlot');
    }

    if (kind === 'title') {
        return { ...slots, titleSlot: takeVacantSlot(slots.titleSlot, child, 'CollapsibleHeaderTitleSlot') };
    }

    return isDefined(slots.titleSlot)
        ? { ...slots, trailing: takeVacantSlot(slots.trailing, child, 'trailing CollapsibleHeaderSlot') }
        : { ...slots, leading: takeVacantSlot(slots.leading, child, 'leading CollapsibleHeaderSlot') };
};

export const getCollapsibleHeaderSlots = (children: ReactNode): CollapsibleHeaderSlotsInterface => {
    const { leading, titleSlot, trailing } = Children.toArray(children).reduce<DiscoveredSlots>(
        assignSlot,
        NO_DISCOVERED_SLOTS
    );

    if (!isDefined(titleSlot)) {
        throw new TypeError('CollapsibleHeader requires a CollapsibleHeaderTitleSlot direct child');
    }

    const titleLayers = Children.toArray(titleSlot.props.children);
    const [expandedTitle, collapsedTitle] = titleLayers;

    if (titleLayers.length !== 2 || !isDefined(expandedTitle) || !isDefined(collapsedTitle)) {
        throw new TypeError('CollapsibleHeader requires expanded and collapsed title direct children');
    }

    return { leading, expandedTitle, collapsedTitle, trailing };
};
