import { StyleSheet } from 'react-native';

import { isDefined, isNumber } from '@rnw-community/shared';

import type { StyleProp, ViewStyle } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

const readPadding = (style: ViewStyle | undefined, key: 'paddingBottom' | 'paddingTop'): number => {
    const value = isDefined(style) ? style[key] : void 0;

    return isNumber(value) ? value : 0;
};

/**
 * Stacks safe-area and chrome content padding on top of consumer padding, leaving horizontal padding untouched.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#addscrollcontentinset
 */
export const addScrollContentInset = (
    insets: EdgeInsets,
    contentInsetTop: number,
    contentInsetBottom: number,
    style: StyleProp<ViewStyle>
): ViewStyle => {
    const flattened = StyleSheet.flatten(style);

    return {
        ...flattened,
        paddingTop: insets.top + contentInsetTop + readPadding(flattened, 'paddingTop'),
        paddingBottom: insets.bottom + contentInsetBottom + readPadding(flattened, 'paddingBottom'),
    };
};
