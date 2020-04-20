import { combine } from '@rnw-community/object-field-tree';

import { FlexAlignItemsEnum } from './enum/flex-align-items.enum';
import { FlexDirectionEnum } from './enum/flex-direction.enum';
import { FlexJustifyContentEnum } from './enum/flex-justify-content.enum';

export const Flex = combine(
    (flexDirection, justifyContent, alignItems) => ({
        flexDirection: FlexDirectionEnum[flexDirection],
        justifyContent: FlexJustifyContentEnum[justifyContent],
        alignItems: FlexAlignItemsEnum[alignItems],
    }),
    FlexDirectionEnum,
    FlexJustifyContentEnum,
    FlexAlignItemsEnum
);
