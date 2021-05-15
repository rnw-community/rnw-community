import type { OnEventFn } from '@rnw-community/shared';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface HoverProps<T = TextStyle | ViewStyle> {
    isDisabled?: boolean;
    disabledStyle?: StyleProp<T>;
    isActive?: boolean;
    activeStyle?: StyleProp<T>;
    isHovered?: boolean;
    hoverStyle?: StyleProp<T>;
    onHover?: OnEventFn<boolean>;
    style?: StyleProp<T>;
    isNested?: boolean;
}
