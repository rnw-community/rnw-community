const ONE_HUNDRED_PERCENT = 100;

/**
 * Element command tapping the element at a point given as percentages of its width and height.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#relativeclick
 */
export const relativeClickCommand = async function relativeClickCommand(
    this: WebdriverIO.Element,
    xPercent: number,
    yPercent: number
): Promise<void> {
    const size = await this.getSize();

    await this.touchAction({
        action: 'tap',
        x: (size.width * xPercent) / ONE_HUNDRED_PERCENT,
        y: (size.height * yPercent) / ONE_HUNDRED_PERCENT,
    });
};
