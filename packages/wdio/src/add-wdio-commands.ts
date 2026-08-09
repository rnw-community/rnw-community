import {
    clearInputCommand,
    openDeepLinkCommand,
    relativeClickCommand,
    slowInputCommand,
    testID$,
    testID$$,
} from './command/index.js';
import { swipeCommand } from './command/swipe.command.js';

import type { Browser } from 'webdriverio';

export const addWdioCommands = (context: Browser): void => {
    context.addCommand('testID$', testID$, false);
    context.addCommand('testID$$', testID$$, false);
    context.addCommand('openDeepLink', openDeepLinkCommand, false);

    context.addCommand(
        'testID$',
        function TestID$(this: WebdriverIO.Element, testID: string) {
            return testID$(testID, this);
        },
        true
    );
    context.addCommand(
        'testID$$',
        function TestID$$(this: WebdriverIO.Element, testID: string) {
            return testID$$(testID, this);
        },
        true
    );
    context.addCommand('slowInput', slowInputCommand, true);
    context.addCommand('clearInput', clearInputCommand, true);
    context.addCommand('relativeClick', relativeClickCommand, true);
    context.addCommand('swipe', swipeCommand, true);
};
