import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { testID$, testID$$, testID$$Index } from '../../command';
import { Component } from '../component/component';

import type { WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from '../../type';

export class RootedComponent extends Component {
    private readonly constructorEl: WebdriverIO.Element | undefined;
    private readonly constructorSelector: string = '';

    constructor(selectorOrElement: WebdriverIO.Element | string) {
        super();

        if (isNotEmptyString(selectorOrElement)) {
            this.constructorSelector = selectorOrElement;
        } else if (isDefined(selectorOrElement)) {
            this.constructorEl = selectorOrElement;
        }
    }

    get RootEl(): Promise<WebdriverIO.Element> {
        if (isDefined(this.constructorEl)) {
            return Promise.resolve(this.constructorEl);
        }

        return testID$(this.constructorSelector);
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

    override async getChildEl(selector: string): Promise<WebdriverIO.Element> {
        return await testID$(selector, await this.RootEl);
    }

    override async getChildEls(selector: string): Promise<WebdriverIO.ElementArray> {
        return await testID$$(selector, await this.RootEl);
    }

    override async getChildElByIdx(selector: string, idx: number): Promise<WebdriverIO.Element> {
        return await testID$$Index(selector, idx, await this.RootEl);
    }
}
