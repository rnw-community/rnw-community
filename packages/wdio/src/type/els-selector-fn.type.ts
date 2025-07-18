import type { SelectorContextType } from './selector-context.type';
import type { ElementReference } from '@wdio/protocols/build/types';
import type { ChainablePromiseArray } from 'webdriverio';

export type ElsSelectorFn = (selector: ElementReference | string, context?: SelectorContextType) => ChainablePromiseArray;
