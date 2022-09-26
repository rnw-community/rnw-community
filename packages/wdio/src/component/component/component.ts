import type { ElSelectorFn, ElsIndexSelectorFn, ElsSelectorFn } from '../../type';
import type {
    ClickArgs,
    ComponentConfigInterface,
    SetValueArgs,
    WaitForDisplayedArgs,
    WaitForEnabledArgs,
    WaitForExistArgs,
} from '../type';
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio';
import type { Location } from 'webdriverio/build/commands/element/getLocation';
import type { Size } from 'webdriverio/build/commands/element/getSize';

export class Component {
    protected elSelectorFn: ElSelectorFn;
    protected elsSelectorFn: ElsSelectorFn;
    protected elsIndexSelectorFn: ElsIndexSelectorFn;

    constructor(config: ComponentConfigInterface) {
        this.elSelectorFn = config.elSelectorFn;
        this.elsSelectorFn = config.elsSelectorFn;
        this.elsIndexSelectorFn = config.elsIndexSelectorFn;
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
