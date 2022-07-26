export const clearInputCommand = async (element: WebdriverIO.Element): Promise<void> => {
    // HINT: Not working
    await element.clearValue();
    // HINT: Not working
    await element.setValue('');

    const currentText = await element.getText();

    await element.sendKeys(Array(currentText.length).fill('\ue017') as string[]);
};
