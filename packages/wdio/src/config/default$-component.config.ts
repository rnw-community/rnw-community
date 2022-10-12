import { byIndex$$, el$, els$ } from '../command';

import type { ComponentConfigInterface } from '../type';

export const default$ComponentConfig: () => ComponentConfigInterface = () => ({
    elSelectorFn: el$,
    elsSelectorFn: els$,
    elsIndexSelectorFn: byIndex$$,
});
