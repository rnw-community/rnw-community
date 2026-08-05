import { testID$, testID$$ } from '../command/index.js';
import { testID$$Index } from '../command/test-id-index.command.js';

import type { ComponentConfigInterface } from '../type/index.js';

export const defaultComponentConfig: () => ComponentConfigInterface = () => ({
    elSelectorFn: testID$,
    elsIndexSelectorFn: testID$$Index,
    elsSelectorFn: testID$$,
});
