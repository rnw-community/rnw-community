import type { Browser, ChainablePromiseElement, Element } from 'webdriverio';

export type SelectorContextType = Browser | ChainablePromiseElement<Element> | Element;
