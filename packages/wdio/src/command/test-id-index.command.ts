import { browser } from '@wdio/globals';

import { testIDSelector } from '../selector';

import type { ElsIndexSelectorFn } from '../type';
import type { ChainablePromiseElement, Element } from 'webdriverio';

export const testID$$Index: ElsIndexSelectorFn = (testID, index, context = browser) =>
    context.$$(testIDSelector(testID))[index] as ChainablePromiseElement<Element>;
