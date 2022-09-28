import {
    clearInputCommand,
    openDeepLinkCommand,
    relativeClickCommand,
    slowInputCommand,
    testID$,
    testID$$,
    testID$$Index,
} from './command';
import { swipeCommand } from './command/swipe.command';

export const addWdioCommands = (context: WebdriverIO.Browser): void => {
    // HINT: Browser commands
    context.addCommand('testID$', testID$, false);
    context.addCommand('testID$$', testID$$, false);
    context.addCommand('testID$$Index', testID$$Index, false);
    context.addCommand('openDeepLink', openDeepLinkCommand, false);

    // HINT: Element commands
    context.addCommand(
        'testID$',
        async function TestID$(this: WebdriverIO.Element, testID: string) {
            return await testID$(testID, this);
        },
        true
    );
    context.addCommand(
        'testID$$',
        async function TestID$$(this: WebdriverIO.Element, testID: string) {
            return await testID$$(testID, this);
        },
        true
    );
    context.addCommand(
        'testID$$Index',
        async function TestID$$Index(this: WebdriverIO.Element, testID: string, idx: number) {
            return await testID$$Index(testID, idx, this);
        },
        true
    );
    context.addCommand('slowInput', slowInputCommand, true);
    context.addCommand('clearInput', clearInputCommand, true);
    context.addCommand('relativeClick', relativeClickCommand, true);
    context.addCommand('swipe', swipeCommand, true);
};
