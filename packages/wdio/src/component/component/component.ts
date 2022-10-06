import { isDefined } from '@rnw-community/shared';

import type { ElSelectorFn, ElsIndexSelectorFn, ElsSelectorFn } from '../../type';
import type {
    ClickArgs,
    ComponentConfigInterface,
    SetValueArgs,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from '../type';
import type { GetAttributeArgs, GetLocationArgs, GetSizeArgs, ScrollIntoViewArgs } from '../type/wdio-types.type';
import type { Enum } from '@rnw-community/shared';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import type { Location } from 'webdriverio/build/commands/element/getLocation';
import type { Size } from 'webdriverio/build/commands/element/getSize';

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
                if (!isDefined(selector)) {
                    return client.callParentComponent(field, receiver);
                }

                /*
                 * TODO: Modify returned value to include everything from ChainablePromiseElement and remove command overrides
                 *  for this we need to call same methods that wdio is using to wrap element
                 * And:
                 * - To have component.Selector.getAttribute(...), this should somehow include RootedComponent support
                 * - Leave el and els, byIdx to get element through correct selector
                 * - Leave all useful custom methods that can be used in RootedComponent
                 * - Fix getLocation|getSize usage to handle both signatures through variable args array
                 */
                return {
                    el: () => client.getChildEl(selector),
                    els: () => client.getChildEls(selector),
                    byIdx: (idx: number) => client.getChildElByIdx(selector, idx),
                    waitForDisplayed: (...args: WaitForDisplayedArgs) => client.waitForDisplayedChildEl(selector, ...args),
                    waitForExist: (...args: WaitForExistArgs) => client.waitForExistChildEl(selector, ...args),
                    waitForEnabled: (...args: WaitForEnabledArgs) => client.waitForEnabledChildEl(selector, ...args),
                    setValue: (...args: SetValueArgs) => client.setValueChildEl(selector, ...args),
                    click: (...args: ClickArgs) => client.clickChildEl(selector, ...args),
                    clickByIdx: (idx: number, ...args: ClickArgs) => client.clickByIdxChildEl(selector, idx, ...args),
                    getText: () => client.getTextChildEl(selector),
                    isDisplayed: () => client.isDisplayedChildEl(selector),
                    isExisting: () => client.isExistingChildEl(selector),
                    getLocation: (...args: GetLocationArgs) => client.getLocationChildEl(selector, ...args),
                    getSize: (...args: GetSizeArgs) => client.getSizeChildEl(selector, ...args),
                    getValue: () => client.getChildEl(selector).getValue(),
                    scrollIntoView: (...args: ScrollIntoViewArgs) => client.getChildEl(selector).scrollIntoView(...args),
                    parentElement: () => client.getParentChildEl(selector),
                    getAttribute: (...args: GetAttributeArgs) => client.getAttributeChildEl(selector, ...args),
                };
            },
        });
    }

    addParentComponent(component: Component): void {
        this.parentComponents.push(component);
    }

    async clickChildEl(selector: string, ...args: ClickArgs): Promise<void> {
        await (await this.getChildEl(selector)).click(...args);
    }

    async clickByIdxChildEl(selector: string, idx: number, ...args: ClickArgs): Promise<void> {
        await (await this.getChildElByIdx(selector, idx)).click(...args);
    }

    async setValueChildEl(selector: string, ...args: SetValueArgs): Promise<void> {
        await (await this.getChildEl(selector)).setValue(...args);
    }

    async isDisplayedChildEl(selector: string): Promise<boolean> {
        return await (await this.getChildEl(selector)).isDisplayed();
    }

    async isExistingChildEl(selector: string): Promise<boolean> {
        return await (await this.getChildEl(selector)).isExisting();
    }

    async getTextChildEl(selector: string): Promise<string> {
        return await (await this.getChildEl(selector)).getText();
    }

    async waitForExistChildEl(selector: string, ...args: WaitForExistArgs): Promise<void> {
        await (await this.getChildEl(selector)).waitForExist(...args);
    }

    async waitForDisplayedChildEl(selector: string, ...args: WaitForDisplayedArgs): Promise<void> {
        await (await this.getChildEl(selector)).waitForDisplayed(...args);
    }

    async waitForEnabledChildEl(selector: string, ...args: WaitForEnabledArgs): Promise<void> {
        await (await this.getChildEl(selector)).waitForEnabled(...args);
    }

    async getLocationChildEl(selector: string, ...args: GetLocationArgs): Promise<Location | number> {
        return await (await this.getChildEl(selector)).getLocation(...args);
    }

    async getSizeChildEl(selector: string, ...args: GetSizeArgs): Promise<Size | number> {
        return await (await this.getChildEl(selector)).getSize(...args);
    }

    async getAttributeChildEl(selector: string, ...args: GetAttributeArgs): Promise<string> {
        return await (await this.getChildEl(selector)).getAttribute(...args);
    }

    getParentChildEl(selector: string): ChainablePromiseElement<WebdriverIO.Element> {
        return this.getChildEl(selector).parentElement();
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
