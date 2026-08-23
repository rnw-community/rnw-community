import { isDefined, isNotEmptyString, isNumber, isPositiveNumber } from '@rnw-community/shared';

import type { EdgeFadePosition } from '../../edge-fade/edge-fade-position.type';
import type { ScreenChromeMaskStopInterface } from '../../edge-fade/screen-chrome-mask-stop.interface';
import type { ScreenChromeColorSetInterface } from '../../interface/screen-chrome-color-set.interface';
import type { ScreenChromeConfigInterface } from '../../interface/screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../../type/screen-chrome-color-scheme.type';

const assertNonEmptyString = (property: string, value: unknown): void => {
    if (!isNotEmptyString(value)) {
        throw new Error(`${property} must be a non-empty string`);
    }
};

const assertPositiveFiniteNumber = (property: string, value: unknown): void => {
    if (!isPositiveNumber(value) || !Number.isFinite(value)) {
        throw new Error(`${property} must be a positive finite number`);
    }
};

const assertNonNegativeFiniteNumber = (property: string, value: unknown): void => {
    if (!isNumber(value) || !Number.isFinite(value) || value < 0) {
        throw new Error(`${property} must be a non-negative finite number`);
    }
};

const assertNumberConfig = (config: ScreenChromeConfigInterface): void => {
    assertPositiveFiniteNumber('headerHeight', config.headerHeight);
    assertNonNegativeFiniteNumber('topFadeHeight', config.topFadeHeight);
    assertNonNegativeFiniteNumber('bottomFadeHeight', config.bottomFadeHeight);
    assertNonNegativeFiniteNumber('headerBackdropHeight', config.headerBackdropHeight);
    assertNonNegativeFiniteNumber('intensity', config.intensity);
    assertNonNegativeFiniteNumber('maxBlurIntensity', config.maxBlurIntensity);
    assertNonNegativeFiniteNumber('collapseStart', config.collapseStart);
    assertNonNegativeFiniteNumber('smallTitleStart', config.smallTitleStart);
    assertNonNegativeFiniteNumber('largeTitleEnd', config.largeTitleEnd);
    assertNonNegativeFiniteNumber('collapseEnd', config.collapseEnd);
    assertPositiveFiniteNumber('scrollEventThrottle', config.scrollEventThrottle);
};

const assertThresholdOrder = (config: ScreenChromeConfigInterface): void => {
    const hasValidOrder =
        config.collapseStart <= config.smallTitleStart &&
        config.smallTitleStart <= config.largeTitleEnd &&
        config.largeTitleEnd <= config.collapseEnd;

    if (!hasValidOrder) {
        throw new Error(
            'collapseStart must be less than or equal to smallTitleStart, smallTitleStart must be less than or equal to largeTitleEnd, and largeTitleEnd must be less than or equal to collapseEnd'
        );
    }

    if (config.collapseEnd === config.collapseStart) {
        throw new Error('collapseEnd must be greater than collapseStart');
    }
};

const assertColorSet = (scheme: ScreenChromeColorScheme, colors: ScreenChromeColorSetInterface | undefined): void => {
    assertNonEmptyString(`colors.${scheme}.solid`, colors?.solid);
    assertNonEmptyString(`colors.${scheme}.wash`, colors?.wash);
};

const assertMaskStopPosition = (position: EdgeFadePosition, stopPosition: string): void => {
    const numericPosition = Number(stopPosition);

    if (!Number.isFinite(numericPosition) || numericPosition < 0 || numericPosition > 1) {
        throw new Error(`maskStops.${position}.${stopPosition} must be between 0 and 1`);
    }
};

const assertMaskStops = (
    position: EdgeFadePosition,
    stops: Readonly<Record<number, ScreenChromeMaskStopInterface>> | undefined
): void => {
    const entries = isDefined(stops) ? Object.entries(stops) : [];

    if (entries.length < 2) {
        throw new Error(`maskStops.${position} must contain at least two stops`);
    }

    entries.forEach(([stopPosition, stop]) => {
        assertMaskStopPosition(position, stopPosition);
        assertNonEmptyString(`maskStops.${position}.${stopPosition}.color`, stop.color);
    });
};

/**
 * Throws a property-specific error when a screen chrome config cannot drive stable scroll animations.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#assertvalidscreenchromeconfig
 */
export const assertValidScreenChromeConfig = (config: ScreenChromeConfigInterface): void => {
    assertNumberConfig(config);
    assertThresholdOrder(config);
    assertColorSet('light', config.colors.light);
    assertColorSet('dark', config.colors.dark);
    assertMaskStops('top', config.maskStops.top);
    assertMaskStops('bottom', config.maskStops.bottom);
};
