import { isDefined } from '@rnw-community/shared';

import { testID$, testID$$, testID$$Index } from '../../command';

import type {
    Enum,
    SelectorObject,
    SetValueArgs,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from '../../type';

export class Component {
    async clickChildEl(selector: string): Promise<void> {
        await (await this.getChildEl(selector)).click();
    }

    async clickByIdxChildEl(selector: string, idx: number): Promise<void> {
        await (await this.getChildElByIdx(selector, idx)).click();
    }

    async setValueChildEl(selector: string, args: SetValueArgs): Promise<void> {
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

    async waitForExistsChildEl(selector: string, args: WaitForExistArgs): Promise<void> {
        await (await this.getChildEl(selector)).waitForExist(...args);
    }

    async waitForDisplayedChildEl(selector: string, args: WaitForDisplayedArgs): Promise<void> {
        await (await this.getChildEl(selector)).waitForDisplayed(...args);
    }

    async waitForEnabledChildEl(selector: string, args: WaitForEnabledArgs): Promise<void> {
        await (await this.getChildEl(selector)).waitForEnabled(...args);
    }

    // eslint-disable-next-line class-methods-use-this
    async getChildEl(selector: string): Promise<WebdriverIO.Element> {
        return await testID$(selector);
    }

    // eslint-disable-next-line class-methods-use-this
    async getChildEls(selector: string): Promise<WebdriverIO.ElementArray> {
        return await testID$$(selector);
    }

    // eslint-disable-next-line class-methods-use-this
    async getChildElByIdx(selector: string, idx: number): Promise<WebdriverIO.Element> {
        return await testID$$Index(selector, idx);
    }

    protected getSelectorObject(selectorValue: string): SelectorObject {
        return {
            el: () => this.getChildEl(selectorValue),
            els: () => this.getChildEls(selectorValue),
            byIdx: (idx: number) => this.getChildElByIdx(selectorValue, idx),
            waitForDisplayed: (...args: WaitForDisplayedArgs) => this.waitForDisplayedChildEl(selectorValue, args),
            waitForExist: (...args: WaitForExistArgs) => this.waitForExistsChildEl(selectorValue, args),
            waitForEnabled: (...args: WaitForEnabledArgs) => this.waitForEnabledChildEl(selectorValue, args),
            setValue: (...args: SetValueArgs) => this.setValueChildEl(selectorValue, args),
            click: () => this.clickChildEl(selectorValue),
            clickByIdx: (idx: number) => this.clickByIdxChildEl(selectorValue, idx),
            getText: () => this.getTextChildEl(selectorValue),
            isDisplayed: () => this.isDisplayedChildEl(selectorValue),
            isExisting: () => this.isExistingChildEl(selectorValue),
        };
    }

    protected callDynamicMethod<T extends string>(selectors: Enum<T>, field: string): unknown {
        const selectorValue = selectors[field];

        if (!isDefined(selectorValue)) {
            return undefined;
        }

        return this.getSelectorObject(selectorValue);
    }
}
