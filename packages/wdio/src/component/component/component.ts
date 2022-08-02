import { testID$, testID$$, testID$$Index } from '../../command';

import type { ClickArgs, SetValueArgs, WaitForDisplayedArgs, WaitForEnabledArgs, WaitForExistArgs } from '../type';
import type { Location } from 'webdriverio/build/commands/element/getLocation';
import type { Size } from 'webdriverio/build/commands/element/getSize';

export class Component {
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
}
