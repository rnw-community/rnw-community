import type { ViewProps } from 'react-native';

export const getCollapsibleHeaderLayerAccessibilityProps = (isExposed: boolean): ViewProps => {
    'worklet';

    return { 'aria-hidden': !isExposed };
};
