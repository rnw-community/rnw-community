export const isBrowserCapability = (): boolean =>
    'browserName' in browser.capabilities && browser.capabilities.browserName !== '';
