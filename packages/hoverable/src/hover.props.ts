import { StyleProp, ViewStyle } from 'react-native';

import { OnEventFn } from '@rnw-community/shared';

export interface HoverProps<T = ViewStyle> {
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
