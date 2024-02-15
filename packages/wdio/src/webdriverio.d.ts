import 'webdriverio';

declare module 'webdriverio' {
    import type { SwipeDirectionType } from './type';

    interface Element {
        clearInput: () => Promise<void>;
        relativeClick: (xPercent: number, yPercent: number) => Promise<void>;
        slowInput: (value: string, delay?: number) => Promise<void>;
        swipe: (direction: SwipeDirectionType, offset = { x: 0, y: 0 }) => Promise<void>;
        testID$: (testID: string) => ChainablePromiseElement<Element>;
        testID$$: (testID: string) => ChainablePromiseArray<ElementArray>;
        testID$$Index: (testID: string, idx: number) => ChainablePromiseElement<Element>;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ChainablePromiseElement<T> {
        clearInput: () => Promise<void>;
        relativeClick: (xPercent: number, yPercent: number) => Promise<void>;
        slowInput: (value: string, delay?: number) => Promise<void>;
        swipe: (direction: SwipeDirectionType, offset = { x: 0, y: 0 }) => Promise<void>;
        testID$: (testID: string) => ChainablePromiseElement<T>;
        testID$$: (testID: string) => ChainablePromiseArray<ElementArray>;
        testID$$Index: (testID: string, idx: number) => ChainablePromiseElement<T | undefined>;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // interface ChainablePromiseArray<T> {}
}
