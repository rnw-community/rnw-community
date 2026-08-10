import { testID$, testID$$ } from '../command';
import { testID$$Index } from '../command/test-id-index.command';

import type { ComponentConfigInterface } from '../type';

export const defaultComponentConfig: () => ComponentConfigInterface = () => ({
    elSelectorFn: testID$,
    elsIndexSelectorFn: testID$$Index,
    elsSelectorFn: testID$$,
});
