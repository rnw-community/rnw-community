import type { SelectorContextType } from './selector-context.type';

export type ElsSelectorFn = (selector: string, context?: SelectorContextType) => Promise<WebdriverIO.ElementArray>;
