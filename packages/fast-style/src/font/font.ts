import { combine } from '@rnw-community/object-field-tree';

import type { Enum } from '@rnw-community/shared';
import type { TextStyle } from 'react-native';

export const getFont = <TFamily extends Enum, TSize extends Enum, TColor extends Enum>(
    fontFamilyObj: TFamily,
    fontSizeObj: TSize,
    fontColorObj: TColor,
    additionalStyle: TextStyle = {}
): ReturnType<typeof combine> => {
    if (Object.values(fontSizeObj).some(item => typeof item === 'number')) {
        throw new Error('fontSizeObj must have string values');
    }

    return combine(
        (fontFamily, fontSize, color) => ({
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
