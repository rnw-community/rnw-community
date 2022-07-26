declare namespace WebdriverIO {
    import type { SwipeDirectionType } from './type';

    interface Browser {
        testID$: (testID: string) => Promise<Element>;
        testID$$: (testID: string) => Promise<ElementArray>;
        testID$$Index: (testID: string) => Promise<Element>;
    }

    interface MultiRemoteBrowser {
        testID$: (testID: string) => Promise<Element>;
        testID$$: (testID: string) => Promise<ElementArray>;
        testID$$Index: (testID: string) => Promise<Element>;
    }

    interface Element {
        clearInput: () => Promise<void>;
        relativeClick: (xPercent: number, yPercent: number) => Promise<void>;
        slowInput: (value: string, delay?: number) => Promise<void>;
        swipe: (direction: SwipeDirectionType, offset = { x: 0, y: 0 }) => Promise<void>;
        testID$: (testID: string) => Promise<Element>;
        testID$$: (testID: string) => Promise<ElementArray>;
        testID$$Index: (testID: string) => Promise<Element>;
    }
}
