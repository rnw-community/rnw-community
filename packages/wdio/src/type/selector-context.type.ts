import type { ChainablePromiseElement } from 'webdriverio';

export type SelectorContextType = ChainablePromiseElement<WebdriverIO.Element> | WebdriverIO.Browser | WebdriverIO.Element;
