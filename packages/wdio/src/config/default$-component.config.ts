import { el$, els$ } from '../command';
import { byIndex$$ } from '../command/by-index.command';

import type { ComponentConfigInterface } from '../type';

export const default$ComponentConfig: () => ComponentConfigInterface = () => ({
    elSelectorFn: el$,
    elsSelectorFn: els$,
    elsIndexSelectorFn: byIndex$$,
});
