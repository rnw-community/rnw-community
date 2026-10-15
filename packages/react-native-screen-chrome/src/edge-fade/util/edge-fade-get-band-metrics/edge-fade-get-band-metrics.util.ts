import { getDefined } from '@rnw-community/shared';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { EdgeFadeBandMetricsInterface } from '../../edge-fade-band-metrics.interface';
import type { EdgeFadePosition } from '../../edge-fade-position.type';
import type { EdgeInsets } from 'react-native-safe-area-context';

/**
 * Resolves the height and safe-area offset an edge-fade band uses, for custom bands positioned outside `EdgeFade`.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#getedgefadebandmetrics
 */
export const getEdgeFadeBandMetrics = (
    position: EdgeFadePosition,
    height: number | undefined,
    config: ScreenChromeConfigInterface,
    insets: EdgeInsets
): EdgeFadeBandMetricsInterface => {
    const resolvedHeight = getDefined(height, () => (position === 'top' ? config.topFadeHeight : config.bottomFadeHeight));
    const inset = position === 'top' ? insets.top : insets.bottom;

    return {
        height: resolvedHeight + inset,
        ...(position === 'top' ? { top: -inset } : { bottom: -inset }),
    };
};
