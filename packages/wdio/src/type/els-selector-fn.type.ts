import type { SelectorContextType } from './selector-context.type';
import type { ElementReference } from '@wdio/protocols';
import type { ChainablePromiseArray } from 'webdriverio';

/**
 * A function finding all elements matching a selector within an optional context.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export type ElsSelectorFn = (selector: ElementReference | string, context?: SelectorContextType) => ChainablePromiseArray;
