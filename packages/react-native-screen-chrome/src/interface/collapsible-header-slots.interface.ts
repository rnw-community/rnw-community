import type { ReactNode } from 'react';

export interface CollapsibleHeaderSlotsInterface {
    readonly leading: ReactNode;
    readonly expandedTitle: ReactNode;
    readonly collapsedTitle: ReactNode;
    readonly trailing: ReactNode;
}
