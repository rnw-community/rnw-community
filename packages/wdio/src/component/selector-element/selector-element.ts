import type { Component } from '../component/component';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

/**
 * WDIO element wrapper witch additional methods supporting chaining.
 */
export class SelectorElement {
    constructor(private readonly component: Component, private readonly enumSelector: string) {
        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get(client, field: string, receiver) {
                if (Reflect.has(client, field)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Reflect.get(client, field, receiver);
                }

                const element = component.getChildEl(enumSelector);
                if (Reflect.has(element, field)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Reflect.get(element, field, receiver);
                }

                throw new Error(`Method/Property "${field}" is not supported by SelectorElement(${enumSelector})`);
            },
        });
    }

    /**
     * Get Promise that will fetch and return WDIO element
     */
    el(): ChainablePromiseElement<WebdriverIO.Element> {
        return this.component.getChildEl(this.enumSelector);
    }

    /**
     * Get Promise that will fetch and return WDIO elements array
     */
    els(): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.component.getChildEls(this.enumSelector);
    }

    /**
     * Get Promise that will fetch and return WDIO elements array item by index
     */
    byIdx(idx: number): ChainablePromiseElement<WebdriverIO.Element> {
        return this.component.getChildElByIdx(this.enumSelector, idx);
    }
}
