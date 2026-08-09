import { $, browser } from '@wdio/globals';

import { isEmptyString } from '@rnw-community/shared';

import { isAndroidCapability, isIOSCapability } from '../../capability';

const getPackageNameFromCapabilities = (context: WebdriverIO.Browser): string =>
    'appPackage' in context.capabilities ? (context.capabilities.appPackage as string) : '';

export const openDeepLinkCommand = async (
    url: string,
    androidPackageName: string = getPackageNameFromCapabilities(browser)
): Promise<void> => {
    if (isAndroidCapability()) {
        if (isEmptyString(androidPackageName)) {
            throw new Error('Cannot open deep link - packageName should be defined');
        }

        await browser.execute('mobile:deepLink', { url, package: androidPackageName });
    } else if (isIOSCapability()) {
        await browser.execute('mobile: launchApp', { bundleId: 'com.apple.mobilesafari' });

        const addressBar = $(`//XCUIElementTypeOther[@name="CapsuleNavigationBar?isSelected=true"]`);

        if (!(await browser.isKeyboardShown())) {
            await addressBar.click();
            await browser.waitUntil(async () => browser.isKeyboardShown());
        }

        const urlField = $(
            `//XCUIElementTypeApplication[@name="Safari"]/XCUIElementTypeWindow[3]/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther[1]`
        );
        await urlField.setValue(`${url}\uE007`);
    }
};
