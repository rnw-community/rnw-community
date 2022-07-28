import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { testID$, testID$$, testID$$Index } from '../command';

import type { SetValueArgs, WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from '../type';

export class VisibleComponent {
    private readonly constructorEl: WebdriverIO.Element | undefined;
    private readonly constructorSelector: string = '';

    constructor(selectorOrElement?: WebdriverIO.Element | string) {
        if (isNotEmptyString(selectorOrElement)) {
            this.constructorSelector = selectorOrElement;
        } else {
            this.constructorEl = selectorOrElement;
        }
    }

    get RootEl(): Promise<WebdriverIO.Element> {
        return isDefined(this.constructorEl) ? Promise.resolve(this.constructorEl) : testID$(this.constructorSelector);
    }

    async isExisting(): Promise<boolean> {
        return await (await this.RootEl).isExisting();
    }

    async isNotExisting(): Promise<void> {
        await (await this.RootEl).waitForDisplayed({ reverse: true });
    }

    async isReady(): Promise<void> {
        await (await this.RootEl).waitForDisplayed();
    }

    async isDisplayed(): Promise<boolean> {
        return await (await this.RootEl).isDisplayed();
    }

    async click(): Promise<void> {
        await (await this.RootEl).click();
    }

    async getChildEl(selector: string, root = this.RootEl): Promise<WebdriverIO.Element> {
        const rootEl = await root;
        if (!isDefined(rootEl)) {
            return await testID$(selector);
        }

        return await rootEl.testID$(selector);
    }

    async getChildEls(selector: string, root = this.RootEl): Promise<WebdriverIO.ElementArray> {
        const rootEl = await root;
        if (!isDefined(rootEl)) {
            return await testID$$(selector);
        }

        return await rootEl.testID$$(selector);
    }

    async getChildElByIdx(selector: string, idx: number, root = this.RootEl): Promise<WebdriverIO.Element> {
        const rootEl = await root;
        if (!isDefined(rootEl)) {
            return await testID$$Index(selector, idx);
        }

        return await rootEl.testID$$Index(selector, idx);
    }

    async clickChildEl(selector: string, root = this.RootEl): Promise<void> {
        await (await this.getChildEl(selector, root)).click();
    }

    async clickByIdxChildEl(selector: string, idx: number, root = this.RootEl): Promise<void> {
        await (await this.getChildElByIdx(selector, idx, root)).click();
    }

    async setValueChildEl(selector: string, args: SetValueArgs, root = this.RootEl): Promise<void> {
        await (await this.getChildEl(selector, root)).setValue(...args);
    }

    async isDisplayedChildEl(selector: string, root = this.RootEl): Promise<boolean> {
        return await (await this.getChildEl(selector, root)).isDisplayed();
    }

    async isExistingChildEl(selector: string, root = this.RootEl): Promise<boolean> {
        return await (await this.getChildEl(selector, root)).isExisting();
    }

    async getTextChildEl(selector: string, root = this.RootEl): Promise<string> {
        return await (await this.getChildEl(selector, root)).getText();
    }

    async waitForExistsChildEl(selector: string, args: WaitForExistArgs, root = this.RootEl): Promise<void> {
        await (await this.getChildEl(selector, root)).waitForExist(...args);
    }

    async waitForDisplayedChildEl(selector: string, args: WaitForDisplayedArgs, root = this.RootEl): Promise<void> {
        await (await this.getChildEl(selector, root)).waitForDisplayed(...args);
    }

    async waitForEnabledChildEl(selector: string, args: WaitForEnabledArgs, root = this.RootEl): Promise<void> {
        await (await this.getChildEl(selector, root)).waitForEnabled(...args);
    }
}
