import type { OnEventFn } from '@rnw-community/shared';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface HoverProps<T = TextStyle | ViewStyle> {
    activeStyle?: StyleProp<T>;
    disabledStyle?: StyleProp<T>;
    hoverStyle?: StyleProp<T>;
    isActive?: boolean;
    isDisabled?: boolean;
    isHovered?: boolean;
    isNested?: boolean;
    onHover?: OnEventFn<boolean>;
    style?: StyleProp<T>;
}
