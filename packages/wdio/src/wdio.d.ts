// Ambient version: https://webdriver.io/docs/customcommands/#extend-type-definitions
declare namespace WebdriverIO {
    import type { SwipeDirectionType } from './type';
    import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

    interface Element {
        clearInput: () => Promise<void>;
        relativeClick: (xPercent: number, yPercent: number) => Promise<void>;
        slowInput: (value: string, delay?: number) => Promise<void>;
        swipe: (direction: SwipeDirectionType, offset = { x: 0, y: 0 }) => Promise<void>;
        testID$: (testID: string) => ChainablePromiseElement<Element>;
        testID$$: (testID: string) => ChainablePromiseArray<ElementArray>;
        testID$$Index: (testID: string, idx: number) => ChainablePromiseElement<Element>;
    }

    interface Browser {
        openDeepLink: (url: string, packageName?: string) => Promise<void>;
        testID$: (testID: string) => ChainablePromiseElement<Element>;
        testID$$: (testID: string) => ChainablePromiseArray<ElementArray>;
        testID$$Index: (testID: string, idx: number) => ChainablePromiseElement<Element>;
    }

    interface MultiRemoteBrowser {
        openDeepLink: (url: string, packageName?: string) => Promise<void>;
        testID$: (testID: string) => ChainablePromiseElement<Element>;
        testID$$: (testID: string) => ChainablePromiseArray<ElementArray>;
        testID$$Index: (testID: string, idx: number) => ChainablePromiseElement<Element>;
    }
}
