import type { ViewProps } from 'react-native';

export const getCollapsibleHeaderLayerAccessibilityProps = (isExposed: boolean): ViewProps => {
    'worklet';

    return {
        accessibilityElementsHidden: !isExposed,
        importantForAccessibility: isExposed ? 'auto' : 'no-hide-descendants',
    };
};
