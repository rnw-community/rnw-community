/**
 * Create a  cross platform solution for opening a deep link
 *
 * @param {string} url
 */
import { isEmptyString } from '@rnw-community/shared';

import { isAndroidCapability, isIOSCapability } from '../../capability';

const getPackageNameFromCapabilities = (context: WebdriverIO.Browser): string =>
    'appPackage' in context.capabilities ? `${context.capabilities.appPackage as string}` : '';

export const openDeepLinkCommand = async (
    url: string,
    packageName: string = getPackageNameFromCapabilities(browser)
): Promise<void> => {
    if (isAndroidCapability()) {
        if (isEmptyString(packageName)) {
            throw new Error('Cannot open deep link - packageName should be defined');
        }

        // TODO: can we use this browser.capabilities.appPackage ?
        await driver.execute('mobile:deepLink', { url: `${url}`, package: packageName });
    } else if (isIOSCapability()) {
        // TODO: Find better IOS implementation, improve speed
        await driver.execute('mobile: launchApp', { bundleId: 'com.apple.mobilesafari' });
        // TODO: How we can read bundleId, is this available in capabilities?

        const urlButtonSelector = "type == 'XCUIElementTypeButton' && name CONTAINS 'URL'";
        const urlFieldSelector = "type == 'XCUIElementTypeTextField' && name CONTAINS 'URL'";
        const urlButton = await $(`-ios predicate string:${urlButtonSelector}`);
        const urlField = await $(`-ios predicate string:${urlFieldSelector}`);

        await urlButton.click();
        await urlField.setValue(`${url}\uE007`);
    }
};
