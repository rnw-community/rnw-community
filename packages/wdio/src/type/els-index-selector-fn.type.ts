import type { SelectorContextType } from './selector-context.type';
import type { ChainablePromiseElement } from 'webdriverio';

export type ElsIndexSelectorFn = (
    selector: string,
    index: number,
    context?: SelectorContextType
) => ChainablePromiseElement<WebdriverIO.Element>;
