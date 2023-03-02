import { $, browser } from '@wdio/globals';

import { isEmptyString } from '@rnw-community/shared';

import { isAndroidCapability, isIOSCapability } from '../../capability';

import type { Browser } from 'webdriverio';

const getPackageNameFromCapabilities = (context: Browser): string =>
    'appPackage' in context.capabilities ? `${context.capabilities.appPackage as string}` : '';

/**
 * Create a  cross platform solution for opening a deep link
 *
 * @param {string} url
 */
export const openDeepLinkCommand = async (
    url: string,
    packageName: string = getPackageNameFromCapabilities(browser)
): Promise<void> => {
    if (isAndroidCapability()) {
        if (isEmptyString(packageName)) {
            throw new Error('Cannot open deep link - packageName should be defined');
        }

        await browser.execute('mobile:deepLink', { url, package: packageName });
    } else if (isIOSCapability()) {
        // TODO: Find better IOS implementation, improve speed
        await browser.execute('mobile: launchApp', { bundleId: 'com.apple.mobilesafari' });

        const addressBar = $(`//XCUIElementTypeOther[@name="CapsuleNavigationBar?isSelected=true"]`);

        if (!(await browser.isKeyboardShown())) {
            await addressBar.click();
            await browser.waitUntil(async () => await browser.isKeyboardShown());
        }

        const urlField = await $(
            `//XCUIElementTypeApplication[@name="Safari"]/XCUIElementTypeWindow[3]/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther[1]`
        );
        await urlField.setValue(`${url}\uE007`);
    }
};
