import {
    clearInputCommand,
    openDeepLinkCommand,
    relativeClickCommand,
    slowInputCommand,
    testID$,
    testID$$,
    testID$$Index,
} from './command';

export const addWdioCommands = (): void => {
    // HINT: Browser commands
    browser.addCommand('testID$', testID$, false);
    browser.addCommand('testID$$', testID$$, false);
    browser.addCommand('testID$$Index', testID$$Index, false);
    browser.addCommand('openDeepLink', openDeepLinkCommand, false);

    // HINT: Element commands
    browser.addCommand(
        'testID$',
        async function TestID$(this: WebdriverIO.Element, testID: string) {
            return await testID$(testID, this);
        },
        true
    );
    browser.addCommand(
        'testID$$',
        async function TestID$$(this: WebdriverIO.Element, testID: string) {
            return await testID$$(testID, this);
        },
        true
    );
    browser.addCommand(
        'testID$$Index',
        async function TestID$$Index(this: WebdriverIO.Element, testID: string, idx: number) {
            return await testID$$Index(testID, idx, this);
        },
        true
    );
    browser.addCommand('slowInput', slowInputCommand, true);
    browser.addCommand('clearInput', clearInputCommand, true);
    browser.addCommand('relativeClick', relativeClickCommand, true);
};
