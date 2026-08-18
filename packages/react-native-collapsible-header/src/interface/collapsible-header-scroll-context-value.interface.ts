import type { CollapsibleHeaderScroll } from './collapsible-header-scroll.interface';
import type { CollapsibleHeaderSnapConfig } from './collapsible-header-snap-config.interface';
import type { Maybe } from '@rnw-community/shared';
import type { SharedValue } from 'react-native-reanimated';

export interface CollapsibleHeaderScrollContextValue extends CollapsibleHeaderScroll {
    readonly snapConfig: SharedValue<Maybe<CollapsibleHeaderSnapConfig>>;
}
