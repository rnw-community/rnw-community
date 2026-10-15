import { createContext } from 'react';

import { emptyFn } from '@rnw-community/shared';

import type { OnEventFn } from '@rnw-community/shared';

export const BottomChromeHeightSetterContext = createContext<OnEventFn<number>>(emptyFn);
