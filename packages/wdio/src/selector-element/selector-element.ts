import type { Component } from '../component/component';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

export class SelectorElement {
    constructor(private readonly component: Component, private readonly enumSelector: string) {
        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get(client, field: string, receiver) {
                if (Reflect.has(client, field)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Reflect.get(client, field, receiver);
                }

                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Reflect.get(component.getChildEl(enumSelector), field, receiver);
            },
        });
    }

    el(): ChainablePromiseElement<WebdriverIO.Element> {
        return this.component.getChildEl(this.enumSelector);
    }

    els(): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.component.getChildEls(this.enumSelector);
    }

    byIdx(idx: number): ChainablePromiseElement<WebdriverIO.Element> {
        return this.component.getChildElByIdx(this.enumSelector, idx);
    }
}
