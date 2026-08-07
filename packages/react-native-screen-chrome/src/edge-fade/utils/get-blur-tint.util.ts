import { ColorSchemeEnum } from '../../enum/color-scheme.enum.js';

import type { BlurTint } from 'expo-blur';

export const getBlurTint = (colorScheme: ColorSchemeEnum, isIos: boolean): BlurTint => {
    if (colorScheme === ColorSchemeEnum.DARK) {
        return 'systemThinMaterialDark';
    }

    return isIos ? 'systemChromeMaterialLight' : 'systemMaterialLight';
};
