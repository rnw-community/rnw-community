import { byIndex$$ } from '../command';

import type { ElSelectorFn, ElsSelectorFn } from '../type';
import type { ComponentConfigInterface } from './type';

// eslint-disable-next-line
declare const $: ElSelectorFn;
// eslint-disable-next-line init-declarations
declare const $$: ElsSelectorFn;

export const default$ComponentConfig: () => ComponentConfigInterface = () => ({
    elSelectorFn: $,
    elsSelectorFn: $$,
    elsIndexSelectorFn: byIndex$$,
});
