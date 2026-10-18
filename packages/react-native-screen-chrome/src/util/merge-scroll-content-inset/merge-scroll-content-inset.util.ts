import { StyleSheet } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import type { StyleProp, ViewStyle } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

type PaddingEdge = 'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop';

const AXIS_SHORTHAND = {
    paddingBottom: 'paddingVertical',
    paddingLeft: 'paddingHorizontal',
    paddingRight: 'paddingHorizontal',
    paddingTop: 'paddingVertical',
} as const;

/**
 * Prepends safe-area and chrome content padding to every edge the consumer style leaves unpadded, so consumer padding wins.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#mergescrollcontentinset
 */
export const mergeScrollContentInset = (
    insets: EdgeInsets,
    top: number,
    bottom: number,
    style: StyleProp<ViewStyle>
): StyleProp<ViewStyle> => {
    const consumerStyle: ViewStyle = { ...StyleSheet.flatten(style) };
    const isUnpadded = (edge: PaddingEdge): boolean =>
        !isDefined(consumerStyle[edge] ?? consumerStyle[AXIS_SHORTHAND[edge]] ?? consumerStyle.padding);

    return [
        {
            ...(isUnpadded('paddingTop') && { paddingTop: insets.top + top }),
            ...(isUnpadded('paddingRight') && { paddingRight: insets.right }),
            ...(isUnpadded('paddingBottom') && { paddingBottom: insets.bottom + bottom }),
            ...(isUnpadded('paddingLeft') && { paddingLeft: insets.left }),
        },
        style,
    ];
};
