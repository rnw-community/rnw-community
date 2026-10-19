/**
 * Builds the Android accessibility-id selector (`~testID`) for a testID.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#wdio-commands-and-utils
 */
export const androidTestIDSelector = (testID: string): string => `~${testID}`;
