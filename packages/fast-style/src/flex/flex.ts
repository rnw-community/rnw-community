import { combine } from '@rnw-community/object-field-tree';

import { FlexAlignItemsEnum } from '../enum/flex-align-items.enum';
import { FlexDirectionEnum } from '../enum/flex-direction.enum';
import { FlexJustifyContentEnum } from '../enum/flex-justify-content.enum';

/**
 * A `Flex.<direction>.<justifyContent>.<alignItems>` lookup of every flexbox style combination, for spreading into styles or passing inline.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/fast-style/readme.md#flex
 */
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
