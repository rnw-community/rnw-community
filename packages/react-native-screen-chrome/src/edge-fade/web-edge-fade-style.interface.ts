import type { ViewStyle } from 'react-native';

interface WebEdgeFadePropertiesInterface {
    readonly backdropFilter?: string;
    readonly WebkitBackdropFilter?: string;
    readonly maskImage?: string;
    readonly WebkitMaskImage?: string;
    readonly maskSize?: string;
    readonly WebkitMaskSize?: string;
    readonly maskPosition?: string;
    readonly WebkitMaskPosition?: string;
    readonly maskRepeat?: string;
    readonly WebkitMaskRepeat?: string;
    readonly backgroundImage?: string;
}

export type WebEdgeFadeStyleInterface = ViewStyle & WebEdgeFadePropertiesInterface;
