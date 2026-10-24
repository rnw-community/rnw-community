import type { PlaygroundConfigInterface } from '../interface/playground-config.interface';

export const PLAYGROUND_BUDGIE_CONFIG: PlaygroundConfigInterface = {
    topHeight: 56,
    bottomHeight: 92,
    topChrome: 32,
    bottomChrome: 68,
    intensity: 30,
    maxBlurIntensity: 30,
    alphas: {
        light: { solid: 0.45, wash: 0.15 },
        dark: { solid: 0.35, wash: 0.1 },
    },
};
