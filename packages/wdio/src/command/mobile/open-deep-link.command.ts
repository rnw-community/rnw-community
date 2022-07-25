/**
 * Create a  cross platform solution for opening a deep link
 *
 * @param {string} url
 */
import { isAndroidCapability, isIOSCapability } from '../../capability';

export const openDeepLinkCommand = async (url: string, prefix: string, packageName: string): Promise<void> => {
    if (isAndroidCapability()) {
        // TODO: can we use this browser.capabilities.appPackage ?
        await driver.execute('mobile:deepLink', { url: `${prefix}${url}`, package: packageName });
    } else if (isIOSCapability()) {
        // TODO: Find better IOS implementation
        await driver.execute('mobile: launchApp', { bundleId: 'com.apple.mobilesafari' });

        const urlButtonSelector = "type == 'XCUIElementTypeButton' && name CONTAINS 'URL'";
        const urlFieldSelector = "type == 'XCUIElementTypeTextField' && name CONTAINS 'URL'";
        const urlButton = await $(`-ios predicate string:${urlButtonSelector}`);
        const urlField = await $(`-ios predicate string:${urlFieldSelector}`);

        await urlButton.click();
        await urlField.setValue(`${prefix}${url}\uE007`);
    }
};
