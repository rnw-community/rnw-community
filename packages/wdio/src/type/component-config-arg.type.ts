import type { ElSelectorFn } from './el-selector-fn.type';
import type { ElsIndexSelectorFn } from './els-index-selector-fn.type';
import type { ElsSelectorFn } from './els-selector-fn.type';

/**
 * The element lookup functions a component uses to resolve its selectors.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export interface ComponentConfigInterface {
    /** Finds the first element matching a selector. */
    elSelectorFn: ElSelectorFn;
    /** Finds the element at an index among all elements matching a selector. */
    elsIndexSelectorFn: ElsIndexSelectorFn;
    /** Finds all elements matching a selector. */
    elsSelectorFn: ElsSelectorFn;
}
