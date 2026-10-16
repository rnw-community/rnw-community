import { getTestID } from '../get-test-id/get-test-id';
import { setTestID } from '../set-test-id/set-test-id';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../../interface';

/**
 * Builds platform-specific testID props from the props' own testID, or `defaultTestID` when absent, joined with the extra segments.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#setproptestid
 */
export const setPropTestID = (
    defaultTestID: string,
    props: AndroidTestIDProps | TestIDProps | WebTestIDProps,
    ...args: (number | string)[]
): AndroidTestIDProps | TestIDProps | WebTestIDProps => setTestID(getTestID(props, defaultTestID), ...args);
