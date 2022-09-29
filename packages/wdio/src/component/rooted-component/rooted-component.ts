import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { Component } from '../component/component';
import { findEnumRootSelector } from '../util';

import type {
    ClickArgs,
    ComponentConfigInterface,
    ComponentInputArg,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from '../type';
import type { Enum } from '@rnw-community/shared';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RootedComponent<T = any> extends Component<T> {
    protected readonly parentElInput: ComponentInputArg;

    constructor(
        config: ComponentConfigInterface,
        public override selectors: Enum<T>,
        selectorOrElement: ComponentInputArg | undefined = findEnumRootSelector(selectors)
    ) {
        if (!isDefined(selectorOrElement)) {
            throw new Error('Cannot create RootedComponent - Neither root selector nor root element is passed');
        }

        super(config, selectors);

        this.parentElInput = selectorOrElement;
    }

    get RootEl(): ChainablePromiseElement<WebdriverIO.Element> {
        if (isNotEmptyString(this.parentElInput)) {
            return this.elSelectorFn(this.parentElInput);
        } else if ('then' in this.parentElInput) {
            return this.parentElInput;
        }

        throw new Error(`RootEl should be either string or ChainablePromiseElement`);
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
        return this.elSelectorFn(selector, this.RootEl);
    }

    override getChildEls(selector: string): ChainablePromiseArray<WebdriverIO.ElementArray> {
        return this.elsSelectorFn(selector, this.RootEl);
    }

    override getChildElByIdx(selector: string, idx: number): ChainablePromiseElement<WebdriverIO.Element> {
        return this.elsIndexSelectorFn(selector, idx, this.RootEl);
    }
}
