import type { SelectorContextType } from './selector-context.type';

export type ElsIndexSelectorFn = (
    selector: string,
    index: number,
    context?: SelectorContextType
) => Promise<WebdriverIO.Element>;
