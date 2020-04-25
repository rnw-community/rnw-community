import { Image, ScrollView, Text, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { withHover } from './with-hover.hoc';

export const HoverText = withHover(Text);
export const HoverView = withHover(View);
export const HoverImage = withHover(Image);
export const HoverScrollView = withHover(ScrollView);
export const HoverTouchableOpacity = withHover(TouchableOpacity);
export const HoverTouchableHighlight = withHover(TouchableHighlight);
export const HoverTouchableWithoutFeedback = withHover(TouchableWithoutFeedback);

export { HoverProps } from './hover.props';
export { withHover } from './with-hover.hoc';
