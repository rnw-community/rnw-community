export const androidTestIdSelector = (testID: string): string => `~${testID}`;

/*
 * TODO: This version is for future
 * export const androidTestID = (testID: string): string =>
 *     `android=resourceId("${browser.capabilities.appPackage}:id/${testID}")`;
 */
