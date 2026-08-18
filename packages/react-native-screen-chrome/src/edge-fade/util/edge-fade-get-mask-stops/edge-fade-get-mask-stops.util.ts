import { easeGradient } from 'react-native-easing-gradient';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { EdgeFadePosition } from '../../edge-fade-position.type';

export const getEdgeFadeMaskStops = (maskStops: ScreenChromeConfigInterface['maskStops'], position: EdgeFadePosition) =>
    easeGradient({ colorStops: maskStops[position] });
