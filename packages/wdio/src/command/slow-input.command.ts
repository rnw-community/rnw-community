const DEFAULT_INPUT_DELAY = 300;

export const slowInputCommand = async (
    el: WebdriverIO.Element,
    value: string,
    delay = DEFAULT_INPUT_DELAY
): Promise<void> => {
    for (const char of value.split('')) {
        // eslint-disable-next-line no-await-in-loop
        await browser.pause(delay);
        // eslint-disable-next-line no-await-in-loop
        await el.addValue(char);
    }
};
