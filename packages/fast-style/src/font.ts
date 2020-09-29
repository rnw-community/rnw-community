import { combine, Enum } from '@rnw-community/object-field-tree';
import { TextStyle } from 'react-native';

export const getFont = <TFamily extends Enum, TSize extends Enum, TColor extends Enum>(
    fontFamilyObj: TFamily,
    fontSizeObj: TSize,
    fontColorObj: TColor,
    additionalStyle: TextStyle = {}
) => {
    if (Object.values(fontSizeObj).some(item => typeof item === 'number')) {
        throw new Error('fontSizeObj must have string values');
    }

    return combine(
        (fontFamily, fontSize, color) => ({
            fontFamily: fontFamilyObj[fontFamily],
            color: fontColorObj[color],
            fontSize: parseInt(fontSizeObj[fontSize] as string, 10),
            ...additionalStyle,
        }),
        fontFamilyObj,
        fontSizeObj,
        fontColorObj
    );
};
