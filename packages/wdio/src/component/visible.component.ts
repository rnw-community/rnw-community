import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { testID$, testID$$, testID$$Index } from '../command';

import type { SetValueArgs, WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from '../type';

export class VisibleComponent {
    private readonly constructorEl: WebdriverIO.Element | undefined;
    private readonly constructorSelector: string = '';
    private readonly hasRoot: boolean;

    constructor(selectorOrElement?: WebdriverIO.Element | string) {
        if (isNotEmptyString(selectorOrElement)) {
            this.hasRoot = true;
            this.constructorSelector = selectorOrElement;
        } else if (isDefined(selectorOrElement)) {
            this.hasRoot = true;
            this.constructorEl = selectorOrElement;
        } else {
            this.hasRoot = false;
        }
    }

    get RootEl(): Promise<WebdriverIO.Element> {
        if (this.hasRoot) {
            if (isNotEmptyString(this.constructorSelector)) {
                return testID$(this.constructorSelector);
            } else if (isDefined(this.constructorEl)) {
                return Promise.resolve(this.constructorEl);
            }
        }

        throw new Error(`${VisibleComponent.name} does not have a RootEl`);
    }

    async waitForDisplayed(...args: WaitForDisplayedArgs): Promise<void> {
        await (await this.RootEl).waitForDisplayed(...args);
    }

    async waitForEnabled(...args: WaitForEnabledArgs): Promise<void> {
        await (await this.RootEl).waitForEnabled(...args);
    }

    async waitForExist(...args: WaitForExistArgs): Promise<void> {
        await (await this.RootEl).waitForExist(...args);
    }

    async isDisplayed(): Promise<boolean> {
        return await (await this.RootEl).isDisplayed();
    }

    async isExisting(): Promise<boolean> {
        return await (await this.RootEl).isExisting();
    }

    async click(): Promise<void> {
        await (await this.RootEl).click();
    }

    async getChildEl(selector: string): Promise<WebdriverIO.Element> {
        if (!this.hasRoot) {
            return await testID$(selector);
        }

        return await testID$(selector, await this.RootEl);
    }

    async getChildEls(selector: string): Promise<WebdriverIO.ElementArray> {
        if (!this.hasRoot) {
            return await testID$$(selector);
        }

        return await testID$$(selector, await this.RootEl);
    }

    async getChildElByIdx(selector: string, idx: number): Promise<WebdriverIO.Element> {
        if (!this.hasRoot) {
            return await testID$$Index(selector, idx);
        }

        return await testID$$Index(selector, idx, await this.RootEl);
    }

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
}
