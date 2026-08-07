import { Children, isValidElement } from 'react';

import { isDefined } from '@rnw-community/shared';

import { CollapsibleHeaderLargeTitle } from '../collapsible-header-large-title/collapsible-header-large-title.js';
import { CollapsibleHeaderLeading } from '../collapsible-header-leading/collapsible-header-leading.js';
import { CollapsibleHeaderSmallTitle } from '../collapsible-header-small-title/collapsible-header-small-title.js';
import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot.js';
import { CollapsibleHeaderTrailing } from '../collapsible-header-trailing/collapsible-header-trailing.js';

import type { CollapsibleHeaderSlotsInterface } from '../interface/collapsible-header-slots.interface.js';
import type { ReactNode } from 'react';

export const getCollapsibleHeaderSlots = (children: ReactNode): CollapsibleHeaderSlotsInterface => {
    let leading: ReactNode = null;
    let titleSlotChildren: ReactNode = null;
    let trailing: ReactNode = null;

    Children.toArray(children).forEach(child => {
        if (!isValidElement<{ readonly children?: ReactNode }>(child)) {
            throw new TypeError('CollapsibleHeader slots must be direct children');
        }

        if (child.type === CollapsibleHeaderLeading && !isDefined(leading)) {
            leading = child;

            return;
        }

        if (child.type === CollapsibleHeaderTitleSlot && !isDefined(titleSlotChildren)) {
            titleSlotChildren = child.props.children;

            return;
        }

        if (child.type === CollapsibleHeaderTrailing && !isDefined(trailing)) {
            trailing = child;

            return;
        }

        throw new TypeError('CollapsibleHeader slots must be direct children');
    });

    let expandedTitle: ReactNode = null;
    let collapsedTitle: ReactNode = null;

    Children.toArray(titleSlotChildren).forEach(child => {
        if (!isValidElement(child)) {
            throw new TypeError('CollapsibleHeader title layers must be direct children');
        }

        if (child.type === CollapsibleHeaderLargeTitle && !isDefined(expandedTitle)) {
            expandedTitle = child;

            return;
        }

        if (child.type === CollapsibleHeaderSmallTitle && !isDefined(collapsedTitle)) {
            collapsedTitle = child;

            return;
        }

        throw new TypeError('CollapsibleHeader title layers must be direct children');
    });

    if (!isDefined(leading) || !isDefined(titleSlotChildren) || !isDefined(trailing)) {
        throw new TypeError('CollapsibleHeader requires leading, title, and trailing direct children');
    }

    if (!isDefined(expandedTitle) || !isDefined(collapsedTitle)) {
        throw new TypeError('CollapsibleHeader requires one large and one small title');
    }

    return { leading, expandedTitle, collapsedTitle, trailing };
};
