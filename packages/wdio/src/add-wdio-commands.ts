import {
    clearInputCommand,
    openDeepLinkCommand,
    relativeClickCommand,
    slowInputCommand,
    testID$,
    testID$$,
} from './command';
import { swipeCommand } from './command/swipe.command';

import type { Browser } from 'webdriverio';

export const addWdioCommands = (context: Browser): void => {
    // HINT: Browser commands
    context.addCommand('testID$', testID$, false);
    context.addCommand('testID$$', testID$$, false);
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
    context.addCommand('slowInput', slowInputCommand, true);
    context.addCommand('clearInput', clearInputCommand, true);
    context.addCommand('relativeClick', relativeClickCommand, true);
    context.addCommand('swipe', swipeCommand, true);
};
