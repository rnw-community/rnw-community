const DEFAULT_INPUT_DELAY = 300;

export const slowInputCommand = async (
    el: WebdriverIO.Element,
    value: string,
    delay = DEFAULT_INPUT_DELAY
): Promise<void> => {
    for await (const char of value.split('')) {
        await browser.pause(delay);
        await el.addValue(char);
    }
};
