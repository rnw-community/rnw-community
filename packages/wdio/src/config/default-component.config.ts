import { testID$, testID$$, testID$$Index } from '../command';

import type { ComponentConfigInterface } from '../type';

export const defaultComponentConfig: () => ComponentConfigInterface = () => ({
    elSelectorFn: testID$,
    elsIndexSelectorFn: testID$$Index,
    elsSelectorFn: testID$$,
});
