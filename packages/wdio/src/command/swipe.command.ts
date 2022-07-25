import type { SwipeDirectionType } from '../type';

const ANDROID_SWIPE_OFFSET = -10;

export const swipeCommand = async (
    element: WebdriverIO.Element,
    direction: SwipeDirectionType,
    offset = { x: 0, y: 0 }
): Promise<void> => {
    const elSize = await element.getSize();
    const elPos = await element.getLocation();
    let swipeStart = { x: 0, y: 0 };
    let swipeEnd = { x: 0, y: 0 };

    const androidRectFix = browser.isAndroid ? ANDROID_SWIPE_OFFSET : 0;
    switch (direction) {
        case 'left':
            swipeStart = {
                x: elPos.x + offset.x + elSize.width + androidRectFix,
                y: elPos.y + elSize.height / 2 + offset.y,
            };
            swipeEnd = { x: elPos.x, y: elPos.y + elSize.height / 2 + offset.y };
            break;

        case 'right':
            swipeStart = { x: elPos.x + offset.x, y: elPos.y + elSize.height / 2 + offset.y };
            swipeEnd = { x: elPos.x + elSize.width + androidRectFix, y: elPos.y + elSize.height / 2 + offset.y };
            break;

        case 'top':
            swipeStart = { x: elSize.width / 2 + offset.x, y: elPos.y + offset.y };
            swipeEnd = { x: elSize.width / 2, y: 50 };
            break;

        case 'bottom':
            swipeStart = { x: elSize.width / 2 + offset.x, y: elPos.y + offset.y };
            swipeEnd = { x: elSize.width / 2, y: elSize.height + ANDROID_SWIPE_OFFSET };
            break;

        default:
            throw new Error('Invalid swipe direction');
    }

    await browser.touchAction([
        { action: 'press', ...swipeStart },
        { action: 'wait', ms: 500 },
        { action: 'moveTo', ...swipeEnd },
        'release',
    ]);
};
