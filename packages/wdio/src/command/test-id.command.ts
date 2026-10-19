import { browser } from '@wdio/globals';

import { isNotEmptyString } from '@rnw-community/shared';

import { testIDSelector } from '../selector';

import type { ElSelectorFn } from '../type';

/**
 * Finds the first element matching a testID within the context, using the platform-specific testID selector.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#testid-and-testid
 */
export const testID$: ElSelectorFn = (testID, context = browser) =>
    context.$(isNotEmptyString(testID) ? testIDSelector(testID) : testID);
