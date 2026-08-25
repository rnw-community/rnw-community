import type { ViewStyle } from 'react-native';

interface WebEdgeFadePropertiesInterface {
    readonly backdropFilter?: string;
    readonly WebkitBackdropFilter?: string;
    readonly maskImage?: string;
    readonly WebkitMaskImage?: string;
    readonly backgroundImage?: string;
}

export type WebEdgeFadeStyleInterface = ViewStyle & WebEdgeFadePropertiesInterface;
