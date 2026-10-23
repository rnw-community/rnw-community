import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../../../type/screen-chrome-color-scheme.type';
import type { EdgeFadePosition } from '../../edge-fade-position.type';

type GradientTuple<T> = readonly [T, T, ...T[]];

const toGradientTuple = <T>([first, second, ...rest]: readonly T[]): GradientTuple<T> => [first, second, ...rest];

export const getEdgeFadeVisuals = (
    position: EdgeFadePosition,
    colorScheme: ScreenChromeColorScheme,
    config: ScreenChromeConfigInterface,
    plateau = 0
) => {
    const colorSet = config.colors[colorScheme];
    const washColors: readonly [string, string] =
        position === 'top' ? [colorSet.solid, colorSet.wash] : [colorSet.wash, colorSet.solid];
    const maskStops = Object.entries(config.maskStops[position])
        .map(([offset, { color }]) => {
            const originalLocation = Number(offset);

            return {
                originalLocation,
                color,
            };
        })
        .sort((first, second) => first.originalLocation - second.originalLocation)
        .map(({ originalLocation, color }) => ({
            location: position === 'top' ? plateau + (1 - plateau) * originalLocation : (1 - plateau) * originalLocation,
            color,
        }));

    return {
        washColors,
        maskColors: toGradientTuple(maskStops.map(({ color }) => color)),
        maskLocations: toGradientTuple(maskStops.map(({ location }) => location)),
    };
};
