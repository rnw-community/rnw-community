import { processColor } from 'react-native';

const BYTE = 256;
const UINT32 = 2 ** 32;

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
    const stops = maskLocations.map((location, index) => {
        const [red, green, blue] = edge.map((channel, channelIndex) => channel + (inner[channelIndex] - channel) * location);
        const [, , , maskAlpha] = toRgba(maskColors[index]);

        return `rgba(${Math.round(red)},${Math.round(green)},${Math.round(blue)},${Number(maskAlpha.toFixed(3))}) ${Number((location * 100).toFixed(4))}%`;
    });

    if (maskLocations[0] > 0) {
        const [, , , maskAlpha] = toRgba(maskColors[0]);

        stops.unshift(`rgba(${edge[0]},${edge[1]},${edge[2]},${Number(maskAlpha.toFixed(3))}) 0%`);
    }

    if (maskLocations[maskLocations.length - 1] < 1) {
        const [, , , maskAlpha] = toRgba(maskColors[maskColors.length - 1]);

        stops.push(`rgba(${inner[0]},${inner[1]},${inner[2]},${Number(maskAlpha.toFixed(3))}) 100%`);
    }

    return `linear-gradient(to bottom, ${stops.join(', ')})`;
};
