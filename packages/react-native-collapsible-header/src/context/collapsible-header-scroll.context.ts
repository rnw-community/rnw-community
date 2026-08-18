import { createContext } from 'react';

import type { CollapsibleHeaderScrollContextValue } from '../interface/collapsible-header-scroll-context-value.interface';
import type { Maybe } from '@rnw-community/shared';

export const CollapsibleHeaderScrollContext = createContext<Maybe<CollapsibleHeaderScrollContextValue>>(null);
