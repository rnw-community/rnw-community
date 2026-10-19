import type { ChainablePromiseElement } from 'webdriverio';

/**
 * The browser or element an element lookup searches within.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#components
 */
export type SelectorContextType = ChainablePromiseElement | WebdriverIO.Browser | WebdriverIO.Element;
