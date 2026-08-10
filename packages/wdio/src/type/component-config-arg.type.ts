import type { ElSelectorFn } from './el-selector-fn.type';
import type { ElsIndexSelectorFn } from './els-index-selector-fn.type';
import type { ElsSelectorFn } from './els-selector-fn.type';

export interface ComponentConfigInterface {
    elSelectorFn: ElSelectorFn;
    elsIndexSelectorFn: ElsIndexSelectorFn;
    elsSelectorFn: ElsSelectorFn;
}
