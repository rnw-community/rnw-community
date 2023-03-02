import type { SelectorContextType } from './selector-context.type';
import type { ChainablePromiseElement, Element } from 'webdriverio';

export type ElsIndexSelectorFn = (
    selector: string,
    index: number,
    context?: SelectorContextType
) => ChainablePromiseElement<Element>;
