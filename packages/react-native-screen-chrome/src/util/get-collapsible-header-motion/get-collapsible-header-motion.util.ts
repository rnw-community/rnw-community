import type { ScreenChromeConfigInterface } from '../../interface/screen-chrome-config.interface';
import type { CollapsibleHeaderMotionConfig } from '@rnw-community/react-native-collapsible-header';

const BACKGROUND_OPACITY_START_PROGRESS = 1;
const POINTER_EVENTS_SWITCH_PROGRESS = 0.5;
const FLAT_TRANSLATE_Y = 0;
const NEUTRAL_SCALE = 1;

export const getCollapsibleHeaderMotion = (config: ScreenChromeConfigInterface): Partial<CollapsibleHeaderMotionConfig> => {
    const collapseDistance = config.collapseEnd - config.collapseStart;

    return {
        expandedOpacityEndProgress: (config.largeTitleEnd - config.collapseStart) / collapseDistance,
        collapsedOpacityStartProgress: (config.smallTitleStart - config.collapseStart) / collapseDistance,
        backgroundOpacityStartProgress: BACKGROUND_OPACITY_START_PROGRESS,
        pointerEventsSwitchProgress: POINTER_EVENTS_SWITCH_PROGRESS,
        expandedTranslateY: FLAT_TRANSLATE_Y,
        expandedScale: NEUTRAL_SCALE,
        collapsedTranslateY: FLAT_TRANSLATE_Y,
    };
};
