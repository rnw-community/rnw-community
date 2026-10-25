import type { PlaygroundConfigInterface } from '../interface/playground-config.interface';

export const PLAYGROUND_BUDGIE_CONFIG: PlaygroundConfigInterface = {
    topHeight: 91,
    bottomHeight: 106,
    topChrome: 32,
    bottomChrome: 68,
    intensity: 18,
    maxBlurIntensity: 18,
    alphas: {
        light: { solid: 0.45, wash: 0.15 },
        dark: { solid: 0.3, wash: 0.3 },
    },
};
