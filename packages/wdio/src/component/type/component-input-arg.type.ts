import type { ChainablePromiseElement } from 'webdriverio';

export type ComponentInputArg = ChainablePromiseElement<WebdriverIO.Element> | WebdriverIO.Element | string;
