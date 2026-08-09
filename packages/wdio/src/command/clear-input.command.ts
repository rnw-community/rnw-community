const attemptNativeClear = async (el: WebdriverIO.Element): Promise<void> => {
    await el.clearValue();
    await el.setValue('');
};

const forceClearWithBackspaces = async (el: WebdriverIO.Element): Promise<void> => {
    const currentValue = await el.getValue();

    await el.sendKeys(Array(currentValue.length).fill('\ue003') as string[]);
};

export const clearInputCommand = async function clearInputCommand(this: WebdriverIO.Element): Promise<void> {
    await attemptNativeClear(this);
    await forceClearWithBackspaces(this);
};
