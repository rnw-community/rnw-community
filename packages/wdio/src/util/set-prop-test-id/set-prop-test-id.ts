import { getTestID } from '../get-test-id/get-test-id';
import { setTestID } from '../set-test-id/set-test-id';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../../interface';

/**
 * Shortcut for getting object with TestID fields by reading it from object with TestID props.
 *
 * This should be used in React components.
 *
 * @see setTestID
 * @see getTestID
 *
 * @param defaultTestID {string} Default TestID value
 * @param props {AndroidTestIDProps | TestIDProps | WebTestIDProps} Object with TestID fields
 * @param args {...string} Additional TestID modifiers
 *
 * @return {AndroidTestIDProps | TestIDProps | WebTestIDProps} Object with platform TestID fields
 */
export const setPropTestID = (
    defaultTestID: string,
    props: AndroidTestIDProps | TestIDProps | WebTestIDProps,
    ...args: (number | string)[]
): AndroidTestIDProps | TestIDProps | WebTestIDProps => setTestID(getTestID(props, defaultTestID), ...args);
