import { easeGradient } from 'react-native-easing-gradient';

import type { ScreenChromeConfigInterface } from '../../interface/screen-chrome-config.interface.js';
import type { EdgeFadePosition } from '../../type/edge-fade-position.type.js';

export const getEdgeFadeMaskStops = (maskStops: ScreenChromeConfigInterface['maskStops'], position: EdgeFadePosition) =>
    easeGradient({ colorStops: maskStops[position] });
