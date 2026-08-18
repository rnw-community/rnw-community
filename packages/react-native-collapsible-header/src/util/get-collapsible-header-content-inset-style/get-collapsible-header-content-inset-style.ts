import type { ViewStyle } from 'react-native';

/**
 * Builds the content-container inset style that reserves space for an overlay-mode collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#getcollapsibleheadercontentinsetstyle
 */
export const getCollapsibleHeaderContentInsetStyle = (expandedHeight: number): ViewStyle => ({
    paddingTop: expandedHeight,
});
