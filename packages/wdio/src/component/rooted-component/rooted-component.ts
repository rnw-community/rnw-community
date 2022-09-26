import { isNotEmptyString } from '@rnw-community/shared';

import { Component } from '../component/component';

import type {
    ClickArgs,
    ComponentConfigInterface,
    ComponentInputArg,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from '../type';

export class RootedComponent extends Component {
    constructor(protected readonly parentElInput: ComponentInputArg, config: ComponentConfigInterface) {
        super(config);
    }

    get RootEl(): Promise<WebdriverIO.Element> {
        if (isNotEmptyString(this.parentElInput)) {
            return this.elSelectorFn(this.parentElInput);
        } else if ('then' in this.parentElInput) {
            return this.parentElInput;
        }

        return Promise.resolve(this.parentElInput);
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

    async click(...args: ClickArgs): Promise<void> {
        await (await this.RootEl).click(...args);
    }

    override async getChildEl(selector: string): Promise<WebdriverIO.Element> {
        return await this.elSelectorFn(selector, await this.RootEl);
    }

    override async getChildEls(selector: string): Promise<WebdriverIO.ElementArray> {
        return await this.elsSelectorFn(selector, await this.RootEl);
    }

    override async getChildElByIdx(selector: string, idx: number): Promise<WebdriverIO.Element> {
        return await this.elsIndexSelectorFn(selector, idx, await this.RootEl);
    }
}
