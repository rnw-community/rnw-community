import { isDefined } from '@rnw-community/shared';

import type { ScreenChromeConfigInterface } from '../../interface/screen-chrome-config.interface.js';
import type { EdgeFadePosition } from '../../type/edge-fade-position.type.js';
import type { EdgeInsets } from 'react-native-safe-area-context';

interface EdgeFadeBandMetricsInterface {
    readonly height: number;
    readonly top?: number;
    readonly bottom?: number;
}

export const getEdgeFadeBandMetrics = (
    position: EdgeFadePosition,
    height: number | undefined,
    config: ScreenChromeConfigInterface,
    insets: EdgeInsets
): EdgeFadeBandMetricsInterface => {
    const defaultHeight = position === 'top' ? config.topFadeHeight : config.bottomFadeHeight;
    const resolvedHeight = isDefined(height) ? height : defaultHeight;
    const inset = position === 'top' ? insets.top : insets.bottom;

    return {
        height: resolvedHeight + inset,
        ...(position === 'top' ? { top: -inset } : { bottom: -inset }),
    };
};
