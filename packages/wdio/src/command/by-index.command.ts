import type { ElsIndexSelectorFn } from '../type';
import type { ChainablePromiseElement } from 'webdriverio';

export const byIndex$$: ElsIndexSelectorFn = (selector, index, context = browser) =>
    context.$$(selector)[index] as ChainablePromiseElement<WebdriverIO.Element>;
