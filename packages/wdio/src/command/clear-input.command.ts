export const clearInputCommand = async function clearInputCommand(this: WebdriverIO.Element): Promise<void> {
    // HINT: Not working
    await this.clearValue();
    // HINT: Not working
    await this.setValue('');

    const currentText = await this.getText();

    await this.sendKeys(Array(currentText.length).fill('\ue017') as string[]);
};
