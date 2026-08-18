import { createContext } from 'react';

import type { Maybe } from '@rnw-community/shared';
import type { SharedValue } from 'react-native-reanimated';

export const CollapsibleHeaderProgressContext = createContext<Maybe<SharedValue<number>>>(null);
