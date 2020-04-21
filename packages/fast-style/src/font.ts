import { combine, Enum } from '@rnw-community/object-field-tree';

export const getFont = <TFamily extends Enum, TSize extends Enum, TColor extends Enum>(
    fontFamilyObj: TFamily,
    fontSizeObj: TSize,
    fontColorObj: TColor
) =>
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
