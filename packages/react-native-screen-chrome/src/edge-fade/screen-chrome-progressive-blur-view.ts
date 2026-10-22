import { requireNativeView } from 'expo';

import type { EdgeFadePosition } from './edge-fade-position.type';
import type { ViewProps } from 'react-native';

interface Props extends ViewProps {
    readonly position: EdgeFadePosition;
    readonly radius: number;
    readonly plateau: number;
}

export const ScreenChromeProgressiveBlurView = requireNativeView<Props>('ScreenChrome');
