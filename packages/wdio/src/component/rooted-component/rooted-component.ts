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
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

export class RootedComponent extends Component {
    constructor(protected readonly parentElInput: ComponentInputArg, config: ComponentConfigInterface) {
        super(config);
    }

    get RootEl(): ChainablePromiseElement<WebdriverIO.Element> {
        if (isNotEmptyString(this.parentElInput)) {
            return this.elSelectorFn(this.parentElInput) as ChainablePromiseElement<WebdriverIO.Element>;
        } else if ('then' in this.parentElInput) {
            return this.parentElInput;
        }

        return Promise.resolve(this.parentElInput) as ChainablePromiseElement<WebdriverIO.Element>;
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

    override getChildEl(selector: string): ChainablePromiseElement<WebdriverIO.Element> {
        return this.RootEl.then(rootEl =>
            this.elSelectorFn(selector, rootEl)
        ) as ChainablePromiseElement<WebdriverIO.Element>;
    }

    override getChildEls(selector: string): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.RootEl.then(rootEl =>
            this.elsSelectorFn(selector, rootEl)
        ) as ChainablePromiseArray<WebdriverIO.ElementArray>;
    }

    override getChildElByIdx(selector: string, idx: number): ChainablePromiseElement<WebdriverIO.Element> {
        return this.RootEl.then(rootEl =>
            this.elsIndexSelectorFn(selector, idx, rootEl)
        ) as ChainablePromiseElement<WebdriverIO.Element>;
    }
}
