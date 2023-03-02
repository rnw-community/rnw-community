import { browser } from '@wdio/globals';

import type { SwipeDirectionType } from '../type';
import type { Element } from 'webdriverio';

interface Position {
    x: number;
    y: number;
}

const getSwipePositionsByDirection = async (
    element: Element,
    direction: SwipeDirectionType,
    offset: Position = { x: 0, y: 0 }
): Promise<[start: Position, end: Position]> => {
    // eslint-disable-next-line no-magic-numbers
    const ANDROID_SWIPE_OFFSET = browser.isAndroid ? -10 : 0;

    const elSize = await element.getSize();
    const elPos = await element.getLocation();

    switch (direction) {
        case 'left':
            return [
                {
                    x: elPos.x + offset.x + elSize.width + ANDROID_SWIPE_OFFSET,
                    y: elPos.y + elSize.height / 2 + offset.y,
                },
                { x: elPos.x, y: elPos.y + elSize.height / 2 + offset.y },
            ];

        case 'right':
            return [
                { x: elPos.x + offset.x, y: elPos.y + elSize.height / 2 + offset.y },
                { x: elPos.x + elSize.width + ANDROID_SWIPE_OFFSET, y: elPos.y + elSize.height / 2 + offset.y },
            ];

        case 'top':
            return [
                { x: elSize.width / 2 + offset.x, y: elPos.y + offset.y },
                { x: elSize.width / 2, y: 50 },
            ];

        case 'bottom':
            return [
                { x: elSize.width / 2 + offset.x, y: elPos.y + offset.y },
                { x: elSize.width / 2, y: elSize.height + ANDROID_SWIPE_OFFSET },
            ];

        default:
            throw new Error('Invalid swipe direction');
    }
};

export const swipeCommand = async function swipeCommand(
    this: Element,
    direction: SwipeDirectionType,
    offset: Position = { x: 0, y: 0 }
): Promise<void> {
    const [swipeStart, swipeEnd] = await getSwipePositionsByDirection(this, direction, offset);

    await browser.touchAction([
        { action: 'press', ...swipeStart },
        { action: 'wait', ms: 500 },
        { action: 'moveTo', ...swipeEnd },
        'release',
    ]);
};
