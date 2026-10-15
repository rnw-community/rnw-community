import { CollapsibleHeaderSlot } from '../../collapsible-header-slot/collapsible-header-slot';
import { CollapsibleHeaderTitleSlot } from '../../collapsible-header-title-slot/collapsible-header-title-slot';

import type { CollapsibleHeaderSlotKind } from '../../type/collapsible-header-slot-kind.type';
import type { ReactElement } from 'react';

const SLOT_KIND_MARKER = 'screenChromeSlotKind';

const isCollapsibleHeaderSlotKind = (value: unknown): value is CollapsibleHeaderSlotKind =>
    value === CollapsibleHeaderSlot.screenChromeSlotKind || value === CollapsibleHeaderTitleSlot.screenChromeSlotKind;

export const getCollapsibleHeaderSlotKind = (element: ReactElement): CollapsibleHeaderSlotKind | undefined => {
    if (element.type === CollapsibleHeaderSlot) {
        return CollapsibleHeaderSlot.screenChromeSlotKind;
    }

    if (element.type === CollapsibleHeaderTitleSlot) {
        return CollapsibleHeaderTitleSlot.screenChromeSlotKind;
    }

    const marker: unknown = Reflect.get(Object(element.type), SLOT_KIND_MARKER);

    return isCollapsibleHeaderSlotKind(marker) ? marker : void 0;
};
