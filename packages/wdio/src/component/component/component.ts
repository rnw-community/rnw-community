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
import type { Enum } from '@rnw-community/shared';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import type { Location } from 'webdriverio/build/commands/element/getLocation';
import type { Size } from 'webdriverio/build/commands/element/getSize';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Component<T extends string = any> {
    protected elSelectorFn: ElSelectorFn;
    protected elsSelectorFn: ElsSelectorFn;
    protected elsIndexSelectorFn: ElsIndexSelectorFn;

    constructor(config: ComponentConfigInterface, public selectors: Enum<T>) {
        this.elSelectorFn = config.elSelectorFn;
        this.elsSelectorFn = config.elsSelectorFn;
        this.elsIndexSelectorFn = config.elsIndexSelectorFn;

        // eslint-disable-next-line no-constructor-return
        return new Proxy(this, {
            get(client, field: T, receiver) {
                if (field in client) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Reflect.get(client, field, receiver);
                }

                const selectorValue = client.selectors[field];
                if (!isDefined(selectorValue)) {
                    return undefined;
                }

                return {
                    el: () => client.getChildEl(selectorValue),
                    els: () => client.getChildEls(selectorValue),
                    byIdx: (idx: number) => client.getChildElByIdx(selectorValue, idx),
                    waitForDisplayed: (...args: WaitForDisplayedArgs) =>
                        client.waitForDisplayedChildEl(selectorValue, ...args),
                    waitForExist: (...args: WaitForExistArgs) => client.waitForExistChildEl(selectorValue, ...args),
                    waitForEnabled: (...args: WaitForEnabledArgs) => client.waitForEnabledChildEl(selectorValue, ...args),
                    setValue: (...args: SetValueArgs) => client.setValueChildEl(selectorValue, ...args),
                    click: (...args: ClickArgs) => client.clickChildEl(selectorValue, ...args),
                    clickByIdx: (idx: number, ...args: ClickArgs) => client.clickByIdxChildEl(selectorValue, idx, ...args),
                    getText: () => client.getTextChildEl(selectorValue),
                    isDisplayed: () => client.isDisplayedChildEl(selectorValue),
                    isExisting: () => client.isExistingChildEl(selectorValue),
                    getLocation: () => client.getLocationChildEl(selectorValue),
                    getSize: () => client.getSizeChildEl(selectorValue),
                };
            },
        });
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

    async getLocationChildEl(selector: string): Promise<Location> {
        return await (await this.getChildEl(selector)).getLocation();
    }

    async getSizeChildEl(selector: string): Promise<Size> {
        return await (await this.getChildEl(selector)).getSize();
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
}
