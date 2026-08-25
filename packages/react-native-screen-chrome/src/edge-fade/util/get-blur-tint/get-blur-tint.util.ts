import type { ScreenChromeColorScheme } from '../../../type/screen-chrome-color-scheme.type';
import type { BlurTint } from 'expo-blur';

export const getBlurTint = (colorScheme: ScreenChromeColorScheme, isIos: boolean): BlurTint => {
    if (colorScheme === 'dark') {
        return 'systemThinMaterialDark';
    }

    return isIos ? 'systemChromeMaterialLight' : 'systemMaterialLight';
};
