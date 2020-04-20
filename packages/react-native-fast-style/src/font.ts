import {combine} from 'object-field-tree/dist/src/combine';
import {Enum} from 'object-field-tree/dist/src/type/enum.type';

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
