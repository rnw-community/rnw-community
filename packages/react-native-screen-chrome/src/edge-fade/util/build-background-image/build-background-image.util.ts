import type { ScreenChromeColorSetInterface } from '../../../interface/screen-chrome-color-set.interface';
import type { EdgeFadePosition } from '../../edge-fade-position.type';

export const buildBackgroundImage = (colorSet: ScreenChromeColorSetInterface, position: EdgeFadePosition): string => {
    const [edge, inner] = [colorSet.solid, colorSet.wash].map(color => `rgb(from ${color} r g b / 1)`);

    return position === 'top'
        ? `linear-gradient(to bottom, ${edge} 0%, ${inner} 100%)`
        : `linear-gradient(to bottom, ${inner} 0%, ${edge} 100%)`;
};
