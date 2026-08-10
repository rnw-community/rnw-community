import { WebSelectorConfig } from '../../config/index.js';
import { Platform } from '../get-platform/get-platform.util.js';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../../interface/index.js';

export const setTestID = (...args: (number | string)[]): AndroidTestIDProps | TestIDProps | WebTestIDProps => {
    const testID = args.join('_');

    if (Platform.OS === 'web') {
        return { [WebSelectorConfig]: testID };
    } else if (Platform.OS === 'ios') {
        return { testID };
    }

    return { accessibilityLabel: testID, testID };
};
