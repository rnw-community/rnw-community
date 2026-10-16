import { WebSelectorConfig } from '../config';

/**
 * Builds the `[data-test-id="testID"]` CSS selector for a testID.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#wdio-commands-and-utils
 */
export const webTestIDSelector = (testID: string): string => `[${WebSelectorConfig}="${testID}"]`;
