import { getDefined, isDefined } from '@rnw-community/shared';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { EdgeFadePropsInterface } from '../../edge-fade-props.interface';

const MINIMUM_BLUR_RADIUS = 8;
const INTENSITY_TO_RADIUS = 0.45;

export const getEdgeFadeBlurRadius = (
    intensity: EdgeFadePropsInterface['intensity'],
    scrollAnimation: EdgeFadePropsInterface['scrollAnimation'],
    config: ScreenChromeConfigInterface
): number => {
    const resolvedIntensity = isDefined(scrollAnimation?.intensityInputRange)
        ? getDefined(scrollAnimation.maxIntensity, () => config.maxBlurIntensity)
        : getDefined(intensity, () => config.intensity);

    return Math.max(MINIMUM_BLUR_RADIUS, resolvedIntensity * INTENSITY_TO_RADIUS);
};
