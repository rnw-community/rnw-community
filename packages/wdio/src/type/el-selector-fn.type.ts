import type { SelectorContextType } from './selector-context.type';
import type { ChainablePromiseElement } from 'webdriverio';

export type ElSelectorFn = (selector: string, context?: SelectorContextType) => ChainablePromiseElement<WebdriverIO.Element>;
