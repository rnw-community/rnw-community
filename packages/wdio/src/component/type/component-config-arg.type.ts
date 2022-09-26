import type { ElSelectorFn, ElsIndexSelectorFn, ElsSelectorFn } from '../../type';

export interface ComponentConfigInterface {
    elSelectorFn?: ElSelectorFn;
    elsIndexSelectorFn?: ElsIndexSelectorFn;
    elsSelectorFn?: ElsSelectorFn;
}
