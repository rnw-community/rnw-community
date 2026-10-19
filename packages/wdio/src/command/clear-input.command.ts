const attemptNativeClear = async (el: WebdriverIO.Element): Promise<void> => {
    await el.clearValue();
    await el.setValue('');
};

const forceClearWithBackspaces = async (el: WebdriverIO.Element): Promise<void> => {
    const currentValue = await el.getValue();

    await el.sendKeys(Array(currentValue.length).fill('\ue003') as string[]);
};

/**
 * Element command clearing an input natively and then deleting any remaining characters with backspaces.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#clearinput
 */
export const clearInputCommand = async function clearInputCommand(this: WebdriverIO.Element): Promise<void> {
    await attemptNativeClear(this);
    await forceClearWithBackspaces(this);
};
