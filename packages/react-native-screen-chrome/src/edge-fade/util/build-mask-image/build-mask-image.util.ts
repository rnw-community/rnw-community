const PERCENT_MULTIPLIER = 100;

export const buildMaskImage = (maskColors: readonly string[], maskLocations: readonly number[]): string => {
    const stopsCss = maskLocations
        .map((location, index) => ({ location, color: maskColors[index] }))
        .sort((first, second) => first.location - second.location)
        .map(({ location, color }) => `${color} ${Number((location * PERCENT_MULTIPLIER).toFixed(4))}%`)
        .join(', ');

    return `linear-gradient(to bottom, ${stopsCss})`;
};
