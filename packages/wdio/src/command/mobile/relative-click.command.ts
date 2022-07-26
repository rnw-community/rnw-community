const ONE_HUNDRED_PERCENT = 100;

export const relativeClickCommand = async function relativeClickCommand(
    element: WebdriverIO.Element,
    xPercent: number,
    yPercent: number
): Promise<void> {
    const size = await element.getSize();

    await element.touchAction({
        action: 'tap',
        x: (size.width * xPercent) / ONE_HUNDRED_PERCENT,
        y: (size.height * yPercent) / ONE_HUNDRED_PERCENT,
    });
};
