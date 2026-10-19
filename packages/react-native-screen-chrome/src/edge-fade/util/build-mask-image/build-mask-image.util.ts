import type { ScreenChromeMaskStopInterface } from '../../screen-chrome-mask-stop.interface';

const PERCENT_MULTIPLIER = 100;

export const buildMaskImage = (maskStops: Readonly<Record<number, ScreenChromeMaskStopInterface>>): string => {
    const stopsCss = Object.entries(maskStops)
        .sort(([firstOffset], [secondOffset]) => Number(firstOffset) - Number(secondOffset))
        .map(([offset, { color }]) => `${color} ${Number(offset) * PERCENT_MULTIPLIER}%`)
        .join(', ');

    return `linear-gradient(to bottom, ${stopsCss})`;
};
