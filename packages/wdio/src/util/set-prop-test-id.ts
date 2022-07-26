import { getTestID } from './get-test-id';
import { setTestID } from './set-test-id';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../interface';

/**
 * Shortcut for getting object with TestID fields by reading it from object with TestID props.
 *
 * This should be used in React components.
 *
 * @see setTestID
 * @see getTestID
 *
 * @param props {AndroidTestIDProps | TestIDProps | WebTestIDProps} Object with TestID fields
 * @param args {...string} Additional TestID modifiers
 *
 * @return {AndroidTestIDProps | TestIDProps | WebTestIDProps} Object with platform TestID fields
 */
export const setPropTestID = (
    props: AndroidTestIDProps | TestIDProps | WebTestIDProps,
    ...args: Array<number | string>
): AndroidTestIDProps | TestIDProps | WebTestIDProps => setTestID(getTestID(props), ...args);
