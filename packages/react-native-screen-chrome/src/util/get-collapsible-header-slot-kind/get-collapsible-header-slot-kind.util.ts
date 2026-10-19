import type { CollapsibleHeaderSlotKind } from '../../type/collapsible-header-slot-kind.type';
import type { ReactElement } from 'react';

export const getCollapsibleHeaderSlotKind = (element: ReactElement): CollapsibleHeaderSlotKind | undefined => {
    const marker: unknown = Reflect.get(Object(element.type), 'screenChromeSlotKind');

    return marker === 'control' || marker === 'title' ? marker : void 0;
};
