import { byIndex$$ } from '../command/by-index.command.js';
import { el$, els$ } from '../command/index.js';

import type { ComponentConfigInterface } from '../type/index.js';

export const default$ComponentConfig: () => ComponentConfigInterface = () => ({
    elSelectorFn: el$,
    elsSelectorFn: els$,
    elsIndexSelectorFn: byIndex$$,
});
