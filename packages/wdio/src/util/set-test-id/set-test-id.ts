import { WebSelectorConfig } from '../../config';
import { Platform } from '../get-platform/get-platform.util';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../../interface';

/**
 * Builds platform-specific testID props from segments joined with `_`, avoiding platform warnings for dynamically generated components.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#settestid
 */
export const setTestID = (...args: (number | string)[]): AndroidTestIDProps | TestIDProps | WebTestIDProps => {
    const testID = args.join('_');

    if (Platform.OS === 'web') {
        return { [WebSelectorConfig]: testID };
    } else if (Platform.OS === 'ios') {
        return { testID };
    }

    return { accessibilityLabel: testID, testID };
};
