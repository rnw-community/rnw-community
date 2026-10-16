import { browser } from '@wdio/globals';

import { isNotEmptyString } from '@rnw-community/shared';

import { testIDSelector } from '../selector';

import type { ElsSelectorFn } from '../type';

/**
 * Finds all elements matching a testID within the context, using the platform-specific testID selector.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#testid-and-testid
 */
export const testID$$: ElsSelectorFn = (testID, context = browser) =>
    context.$$(isNotEmptyString(testID) ? testIDSelector(testID) : testID);
