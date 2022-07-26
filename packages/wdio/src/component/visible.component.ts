// TODO: Remove this when this rule will be fixed
/* eslint-disable @typescript-eslint/member-ordering */
import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { testID$ } from '../command';

export class VisibleComponent {
    private readonly constructorEl: WebdriverIO.Element | undefined;
    private readonly constructorSelector: string = '';

    constructor(selectorOrElement: WebdriverIO.Element | string) {
        if (isNotEmptyString(selectorOrElement)) {
            this.constructorSelector = selectorOrElement;
        } else {
            this.constructorEl = selectorOrElement;
        }
    }

    get rootEl(): Promise<WebdriverIO.Element> {
        return isDefined(this.constructorEl) ? Promise.resolve(this.constructorEl) : testID$(this.constructorSelector);
    }

    async isExisting(): Promise<boolean> {
        return await (await this.rootEl).isExisting();
    }

    async isNotExisting(): Promise<void> {
        await (await this.rootEl).waitForDisplayed({ reverse: true });
    }

    async isReady(): Promise<void> {
        await (await this.rootEl).waitForDisplayed();
    }

    async isDisplayed(): Promise<boolean> {
        return await (await this.rootEl).isDisplayed();
    }

    async getChildEl(selector: string, root = this.rootEl): Promise<WebdriverIO.Element> {
        return await root.then(async rootEl => await rootEl.testID$(selector));
    }

    async getChildEls(selector: string, root = this.rootEl): Promise<WebdriverIO.ElementArray> {
        return await root.then(async rootEl => await rootEl.testID$$(selector));
    }
}
