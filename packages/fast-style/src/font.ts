import { combine, Enum } from '@rnw-community/object-field-tree';

export const getFont = (fontFamilyObj: Enum, fontSizeObj: Enum, fontColorObj: Enum) =>
    combine(
        (fontFamily, fontSize, color) => ({
            fontFamily: fontFamilyObj[fontFamily],
            fontSize: parseInt(fontSizeObj[fontSize], 10),
            color: fontColorObj[color],
        }),
        fontFamilyObj,
        fontSizeObj,
        fontColorObj
    );
