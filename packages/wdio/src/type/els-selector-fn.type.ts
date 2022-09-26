import type { SelectorContextType } from './selector-context.type';
import type { ChainablePromiseArray } from 'webdriverio';

export type ElsSelectorFn = (
    selector: string,
    context?: SelectorContextType
) => ChainablePromiseArray<WebdriverIO.ElementArray>;
