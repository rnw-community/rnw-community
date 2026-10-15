import { createContext } from 'react';

import { emptyFn } from '@rnw-community/shared';

import type { BottomChromeHeightRegistryInterface } from '../interface/bottom-chrome-height-registry.interface';

export const BottomChromeHeightSetterContext = createContext<BottomChromeHeightRegistryInterface>({
    publish: emptyFn,
    withdraw: emptyFn,
});
