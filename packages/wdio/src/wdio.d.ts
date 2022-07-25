declare namespace WebdriverIO {
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
        slowInput: (value: string, delay: number) => Promise<void>;
        testID$: (testID: string) => Promise<Element>;
        testID$$: (testID: string) => Promise<ElementArray>;
        testID$$Index: (testID: string) => Promise<Element>;
    }
}
