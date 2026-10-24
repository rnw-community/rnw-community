import { processColor } from 'react-native';

const BYTE = 256;
const UINT32 = 2 ** 32;
const PERCENT = 100;

const toRgba = (color: string): readonly [number, number, number, number] => {
    const processed = Number(processColor(color));
    const argb = processed < 0 ? processed + UINT32 : processed;

    return [
        Math.floor(argb / BYTE ** 2) % BYTE,
        Math.floor(argb / BYTE) % BYTE,
        argb % BYTE,
        Math.floor(argb / BYTE ** 3) / (BYTE - 1),
    ];
};

export const buildNativeWashImage = (
    washColors: readonly [string, string],
    maskColors: readonly string[],
    maskLocations: readonly number[]
): string => {
    const [edge, inner] = washColors.map(toRgba);
    const toStop = (location: number, maskColor: string): string => {
        const [red, green, blue, alpha] = edge.map((channel, index) => channel + (inner[index] - channel) * location);
        const [, , , maskAlpha] = toRgba(maskColor);

        return `rgba(${Math.round(red)},${Math.round(green)},${Math.round(blue)},${Number((alpha * maskAlpha).toFixed(3))}) ${Number((location * PERCENT).toFixed(4))}%`;
    };
    const stops = maskLocations.map((location, index) => toStop(location, maskColors[index]));

    if (maskLocations[0] > 0) {
        stops.unshift(toStop(0, maskColors[0]));
    }

    if (maskLocations[maskLocations.length - 1] < 1) {
        stops.push(toStop(1, maskColors[maskColors.length - 1]));
    }

    return `linear-gradient(to bottom, ${stops.join(', ')})`;
};
