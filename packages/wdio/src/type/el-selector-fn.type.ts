import type { SelectorContextType } from './selector-context.type';

export type ElSelectorFn = (selector: string, context?: SelectorContextType) => Promise<WebdriverIO.Element>;
