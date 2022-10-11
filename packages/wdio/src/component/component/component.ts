import { isDefined } from '@rnw-community/shared';

import { SelectorElement } from '../selector-element/selector-element';

import type { ElSelectorFn, ElsIndexSelectorFn, ElsSelectorFn } from '../../type';
import type { ComponentConfigInterface } from '../type';
import type { Enum } from '@rnw-community/shared';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

/*
 * TODO: Fix getLocation|getSize usage to handle both signatures through variable args array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Component<T = any> {
    protected elSelectorFn: ElSelectorFn;
    protected elsSelectorFn: ElsSelectorFn;
    protected elsIndexSelectorFn: ElsIndexSelectorFn;
    protected parentComponents: Component[] = [];

    constructor(config: ComponentConfigInterface, public selectors: Enum<T>) {
        this.elSelectorFn = config.elSelectorFn;
        this.elsSelectorFn = config.elsSelectorFn;
        this.elsIndexSelectorFn = config.elsIndexSelectorFn;

        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get(client, field: string, receiver) {
                if (Reflect.has(client, field)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Reflect.get(client, field, receiver);
                }

                const selector = client.selectors[field] as unknown as string;
                if (isDefined(selector)) {
                    return new SelectorElement(client, selector);
                }

                return client.callParentComponent(field, receiver);
            },
        });
    }

    addParentComponent(component: Component): void {
        this.parentComponents.push(component);
    }

    getChildEl(selector: string): ChainablePromiseElement<WebdriverIO.Element> {
        return this.elSelectorFn(selector);
    }

    getChildEls(selector: string): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.elsSelectorFn(selector);
    }

    getChildElByIdx(selector: string, idx: number): ChainablePromiseElement<WebdriverIO.Element> {
        return this.elsIndexSelectorFn(selector, idx);
    }

    private callParentComponent(field: string, receiver: unknown): unknown {
        for (const parentComponent of this.parentComponents) {
            if (Reflect.has(parentComponent, field) || field in parentComponent.selectors) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Reflect.get(parentComponent, field, receiver);
            }
        }

        return undefined;
    }
}
