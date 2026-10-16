import type { SelectorContextType } from './selector-context.type';
import type { ElementReference } from '@wdio/protocols';
import type { ChainablePromiseElement } from 'webdriverio';

/**
 * A function finding the first element matching a selector within an optional context.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export type ElSelectorFn = (selector: ElementReference | string, context?: SelectorContextType) => ChainablePromiseElement;
