import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';

export type CollapsibleHeaderGeometry = Required<
    Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance' | 'collapseStart'>
>;
