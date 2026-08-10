import { getTestID } from '../get-test-id/get-test-id';
import { setTestID } from '../set-test-id/set-test-id';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../../interface';

export const setPropTestID = (
    defaultTestID: string,
    props: AndroidTestIDProps | TestIDProps | WebTestIDProps,
    ...args: (number | string)[]
): AndroidTestIDProps | TestIDProps | WebTestIDProps => setTestID(getTestID(props, defaultTestID), ...args);
