import type { SelectorContextType } from './selector-context.type.js';
import type { ChainablePromiseElement } from 'webdriverio';

export type ElsIndexSelectorFn = (selector: string, index: number, context?: SelectorContextType) => ChainablePromiseElement;
