import { processColor } from 'react-native';

type Rgba = readonly [number, number, number, number];

const BYTE = 256;
const UINT32 = 2 ** 32;

const toRgba = (color: string): Rgba => {
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
    const stops = maskLocations.map((location, index) => {
        const [red, green, blue, alpha] = edge.map(
            (channel, channelIndex) => channel + (inner[channelIndex] - channel) * location
        );
        const [, , , maskAlpha] = toRgba(maskColors[index]);

        return `rgba(${Math.round(red)},${Math.round(green)},${Math.round(blue)},${Number((alpha * maskAlpha).toFixed(3))}) ${location * 100}%`;
    });

    return `linear-gradient(to bottom, ${stops.join(', ')})`;
};
