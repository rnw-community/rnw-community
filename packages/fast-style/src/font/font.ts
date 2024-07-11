import { type CombineReturn3, combine } from '@rnw-community/object-field-tree';

import type { Enum } from '@rnw-community/shared';
import type { ColorValue, TextStyle } from 'react-native';

export const getFont = <
    TFamily extends Enum<string | undefined>,
    TSize extends Enum,
    TColor extends Enum<ColorValue | undefined>,
>(
    fontFamilyObj: TFamily,
    fontSizeObj: TSize,
    fontColorObj: TColor,
    additionalStyle: TextStyle = {}
): CombineReturn3<TextStyle, TFamily, TSize, TColor> => {
    if (Object.values(fontSizeObj).some(item => typeof item === 'number')) {
        throw new Error('fontSizeObj must have string values');
    }

    return combine(
        (fontFamily, fontSize, color): TextStyle => ({
            fontFamily: fontFamilyObj[fontFamily],
            fontSize: parseInt(fontSizeObj[fontSize] as string, 10),
            color: fontColorObj[color],
            ...additionalStyle,
        }),
        fontFamilyObj,
        fontSizeObj,
        fontColorObj
    );
};
