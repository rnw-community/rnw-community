import { browser } from '@wdio/globals';

import { isAndroidCapability } from '../capability';

const DEFAULT_INPUT_DELAY = 300;

export const slowInputCommand = async function slowInputCommand(
    this: WebdriverIO.Element,
    value: string,
    delay = DEFAULT_INPUT_DELAY
): Promise<void> {
    if (isAndroidCapability()) {
        await this.setValue(value);
    } else {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        for await (const char of value.split('')) {
            await browser.pause(delay);
            await this.addValue(char);
        }
    }
};
