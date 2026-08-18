import type { CollapsibleHeaderSnapConfig } from './collapsible-header-snap-config.interface';
import type { CollapsibleHeaderScrollRef } from '../type/collapsible-header-scroll-ref.type';
import type { Maybe } from '@rnw-community/shared';
import type { SharedValue } from 'react-native-reanimated';

export interface CollapsibleHeaderScrollWorkletsConfig {
    readonly scrollY: SharedValue<number>;
    readonly scrollRef: CollapsibleHeaderScrollRef;
    readonly snapConfig: SharedValue<Maybe<CollapsibleHeaderSnapConfig>>;
    readonly snapSettleGeneration: SharedValue<number>;
    readonly snapAnimated: boolean;
}
