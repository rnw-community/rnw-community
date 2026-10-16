import type { SelectorContextType } from './selector-context.type';
import type { ChainablePromiseElement } from 'webdriverio';

/**
 * A function finding the element at an index among all elements matching a selector within an optional context.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export type ElsIndexSelectorFn = (selector: string, index: number, context?: SelectorContextType) => ChainablePromiseElement;
