import type { ElSelectorFn } from './el-selector-fn.type.js';
import type { ElsIndexSelectorFn } from './els-index-selector-fn.type.js';
import type { ElsSelectorFn } from './els-selector-fn.type.js';

export interface ComponentConfigInterface {
    elSelectorFn: ElSelectorFn;
    elsIndexSelectorFn: ElsIndexSelectorFn;
    elsSelectorFn: ElsSelectorFn;
}
