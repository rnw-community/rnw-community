import { WebSelectorConfig } from '../config';

import { Platform } from './get-platform.util';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../interface';

/**
 * Get WEB, IOS and Android supported object with `testID` props.
 *
 * Method support oped-ended args for test identifiers useful for dynamically
 * generated components.
 *
 * @params {...string} Test identifiers
 * @returns Concatenated Test identifiers using `_` symbol
 */
export const setTestID = (...args: Array<number | string>): AndroidTestIDProps | TestIDProps | WebTestIDProps => {
    const testID = args.join('_');

    if (Platform.OS === 'web') {
        return { [WebSelectorConfig]: testID, testID };
    } else if (Platform.OS === 'ios') {
        return { testID };
    }

    return { accessibilityLabel: testID, testID };
};
