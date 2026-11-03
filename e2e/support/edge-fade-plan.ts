export const SCHEMES = ['dark', 'light'] as const;
export const BACKGROUNDS = ['dark', 'light', 'vivid'] as const;

/** One temporal recording: the harness controls tapped first, and the scheme-background cell it then records. */
interface TemporalStep {
    readonly taps: readonly ('edge-fade-harness-scheme' | 'edge-fade-harness-background')[];
    readonly cell: `${(typeof SCHEMES)[number]}-${(typeof BACKGROUNDS)[number]}`;
}

/**
 * The temporal harness's six recordings in order. The scheme control flips the scheme and the background control
 * cycles dark, light, vivid, so a scheme change also taps the background back round to dark.
 */
export const TEMPORAL_PLAN: readonly TemporalStep[] = SCHEMES.flatMap((scheme, schemeIndex) =>
    BACKGROUNDS.map((background, backgroundIndex) => ({
        taps: [
            ...(schemeIndex > 0 && backgroundIndex === 0 ? (['edge-fade-harness-scheme'] as const) : []),
            ...(schemeIndex + backgroundIndex > 0 ? (['edge-fade-harness-background'] as const) : []),
        ],
        cell: `${scheme}-${background}` as const,
    }))
);
