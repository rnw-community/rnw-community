import { Children, isValidElement } from 'react';

import { isDefined } from '@rnw-community/shared';

import { CollapsibleHeaderSlot } from '../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot';

import type { CollapsibleHeaderSlotsInterface } from '../interface/collapsible-header-slots.interface';
import type { ReactNode } from 'react';

export const getCollapsibleHeaderSlots = (children: ReactNode): CollapsibleHeaderSlotsInterface => {
    const slots = Children.toArray(children);
    const [leading, titleSlot, trailing] = slots;
    const hasValidSlots =
        slots.length === 3 &&
        isValidElement(leading) &&
        leading.type === CollapsibleHeaderSlot &&
        isValidElement<{ readonly children?: ReactNode }>(titleSlot) &&
        titleSlot.type === CollapsibleHeaderTitleSlot &&
        isValidElement(trailing) &&
        trailing.type === CollapsibleHeaderSlot;

    if (!hasValidSlots) {
        throw new TypeError('CollapsibleHeader requires leading, title, and trailing direct children');
    }

    const titleLayers = Children.toArray(titleSlot.props.children);
    const [expandedTitle, collapsedTitle] = titleLayers;

    if (titleLayers.length !== 2 || !isDefined(expandedTitle) || !isDefined(collapsedTitle)) {
        throw new TypeError('CollapsibleHeader requires expanded and collapsed title direct children');
    }

    return { leading, expandedTitle, collapsedTitle, trailing };
};
