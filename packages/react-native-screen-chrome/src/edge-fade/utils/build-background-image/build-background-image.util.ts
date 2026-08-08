import type { ScreenChromeColorSetInterface } from '../../../interface/screen-chrome-color-set.interface.js';
import type { EdgeFadePosition } from '../../../type/edge-fade-position.type.js';

const PERCENT_MULTIPLIER = 100;
const WASH_STOP_PERCENT = 72;

export const buildBackgroundImage = (colorSet: ScreenChromeColorSetInterface, position: EdgeFadePosition): string => {
    if (position === 'top') {
        return `linear-gradient(to bottom, ${colorSet.solid} 0%, ${colorSet.wash} ${WASH_STOP_PERCENT}%, transparent ${PERCENT_MULTIPLIER}%)`;
    }

    return `linear-gradient(to bottom, transparent 0%, ${colorSet.wash} ${PERCENT_MULTIPLIER - WASH_STOP_PERCENT}%, ${colorSet.solid} ${PERCENT_MULTIPLIER}%)`;
};
