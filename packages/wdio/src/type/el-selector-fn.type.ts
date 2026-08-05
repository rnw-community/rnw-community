import type { SelectorContextType } from './selector-context.type.js';
import type { ElementReference } from '@wdio/protocols';
import type { ChainablePromiseElement } from 'webdriverio';

export type ElSelectorFn = (selector: ElementReference | string, context?: SelectorContextType) => ChainablePromiseElement;
