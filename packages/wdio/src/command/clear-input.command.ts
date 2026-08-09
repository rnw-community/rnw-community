const attemptNativeClear = async (el: WebdriverIO.Element): Promise<void> => {
    await el.clearValue();
    await el.setValue('');
};

const forceClearWithBackspaces = async (el: WebdriverIO.Element): Promise<void> => {
    const currentText = await el.getText();

    await el.sendKeys(Array(currentText.length).fill('\ue017') as string[]);
};

export const clearInputCommand = async function clearInputCommand(this: WebdriverIO.Element): Promise<void> {
    await attemptNativeClear(this);
    await forceClearWithBackspaces(this);
};
