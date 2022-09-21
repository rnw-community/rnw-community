import { WebSelectorConfig } from '../../config';
import { Platform } from '../get-platform.util';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../../interface';

/**
 * Get WEB, IOS and Android supported object with TestID fields.
 *
 * @param args {...string} Additional TestID modifiers
 *
 * @return {AndroidTestIDProps | TestIDProps | WebTestIDProps} Object with platform TestID fields
 */
export const setTestID = (...args: Array<number | string>): AndroidTestIDProps | TestIDProps | WebTestIDProps => {
    const testID = args.join('_');

    if (Platform.OS === 'web') {
        return { [WebSelectorConfig]: testID };
    } else if (Platform.OS === 'ios') {
        return { testID };
    }

    return { accessibilityLabel: testID, testID };
};
