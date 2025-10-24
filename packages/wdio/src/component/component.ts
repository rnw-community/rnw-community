/* eslint-disable */
import { isDefined } from '@rnw-community/shared';

import { SelectorElement } from '../selector-element/selector-element';

import type { ComponentConfigInterface } from '../type';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

 
export class Component<T = any> {
    protected parentComponents: Component[] = [];

    constructor(
        protected config: ComponentConfigInterface,
        protected selectors: T
    ) {
         
        return new Proxy(this, {
             
            get(client, field: string, receiver) {
                return client.proxyGet(field, receiver);
            },
        });
    }

    addParentComponent(component: Component): void {
        this.parentComponents.push(component);
    }

    getChildEl(selector: string): ChainablePromiseElement {
        return this.config.elSelectorFn(selector);
    }

    getChildEls(selector: string): ChainablePromiseArray {
        return this.config.elsSelectorFn(selector);
    }

    getChildElByIdx(selector: string, idx: number): ChainablePromiseElement {
        return this.config.elsIndexSelectorFn(selector, idx);
    }

    async getComponentFromEls<E>(
        selector: string,
        componentFn: (el: WebdriverIO.Element) => Promise<E>,
        predicateFn: (component: E, idx: number) => Promise<boolean>
    ): Promise<E> {
        let idx = 0;
        for await (const el of await this.getChildEls(selector)) {
            const component = await componentFn(el);

            if (await predicateFn(component, idx++)) {
                return component;
            }
        }

        throw new Error(`Failed finding component from elements array "${selector}"`);
    }

    protected proxyGet(field: string, receiver: unknown, notFoundFn?: () => unknown): unknown {
        if (Reflect.has(this, field)) {
             
            return Reflect.get(this, field, receiver);
        }

        const selector = (this.selectors as Record<string, T>)[field] as unknown as string;
        if (isDefined(selector)) {
            return new SelectorElement(this, selector);
        }

        for (const parentComponent of this.parentComponents) {
            if (Reflect.has(parentComponent, field) || field in parentComponent.selectors) {
                 
                return Reflect.get(parentComponent, field, receiver);
            }
        }

        return notFoundFn?.();
    }
}
