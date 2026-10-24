import type { ScreenChromeColorSetInterface } from '../../../interface/screen-chrome-color-set.interface';
import type { EdgeFadePosition } from '../../edge-fade-position.type';

export const buildBackgroundImage = (colorSet: ScreenChromeColorSetInterface, position: EdgeFadePosition): string =>
    position === 'top'
        ? `linear-gradient(to bottom, ${colorSet.solid} 0%, ${colorSet.wash} 100%)`
        : `linear-gradient(to bottom, ${colorSet.wash} 0%, ${colorSet.solid} 100%)`;
