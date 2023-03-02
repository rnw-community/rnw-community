import type { Element } from 'webdriverio';

const ONE_HUNDRED_PERCENT = 100;

export const relativeClickCommand = async function relativeClickCommand(
    this: Element,
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
