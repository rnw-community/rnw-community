import type { ChainablePromiseElement, Element } from 'webdriverio';

export type SelectorContextType = ChainablePromiseElement<Element> | Element | WebdriverIO.Browser;
