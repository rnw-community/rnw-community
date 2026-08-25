import type { StyleProp, ViewStyle } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

/**
 * Prepends safe-area and chrome content padding while preserving consumer styles after generated padding.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#mergescrollcontentinset
 */
export const mergeScrollContentInset = (
    insets: EdgeInsets,
    top: number,
    bottom: number,
    style: StyleProp<ViewStyle>
): StyleProp<ViewStyle> => [
    {
        paddingTop: insets.top + top,
        paddingRight: insets.right,
        paddingBottom: insets.bottom + bottom,
        paddingLeft: insets.left,
    },
    style,
];
