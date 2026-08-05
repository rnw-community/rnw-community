export { addWdioCommands } from './add-wdio-commands.js';
export { isAndroidCapability } from './capability/is-android.capability.js';
export { isBrowserCapability } from './capability/is-browser.capability.js';
export { isIOSCapability } from './capability/is-ios.capability.js';
export { byIndex$$ } from './command/by-index.command.js';
export { clearInputCommand } from './command/clear-input.command.js';
export { openDeepLinkCommand } from './command/mobile/open-deep-link.command.js';
export { relativeClickCommand } from './command/mobile/relative-click.command.js';
export { slowInputCommand } from './command/slow-input.command.js';
export { testID$$Index } from './command/test-id-index.command.js';
export { testID$ } from './command/test-id.command.js';
export { testID$$ } from './command/test-ids.command.js';
export { Component, createComponent, getComponent, getExtendedComponent } from './component/index.js';
export { createComponent$ } from './component$/create-component$/create-component$.js';
export { getComponent$ } from './component$/get-component$/get-component$.js';
export { getExtendedComponent$ } from './component$/get-exteded-component$/get-extended-component$.js';
export type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from './interface/index.js';
export { createRootedComponent, getExtendedRootedComponent, getRootedComponent, RootedComponent } from './rooted-component/index.js';
export { createRootedComponent$ } from './rooted-component$/create-rooted-component$/create-rooted-component$.js';
export { getExtendedRootedComponent$ } from './rooted-component$/get-extended-rooted-component$/get-extended-rooted-component$.js';
export { getRootedComponent$ } from './rooted-component$/get-rooted-component$/get-rooted-component$.js';
export {
    androidTestIDSelector,
    iosTestIDSelector,
    mobileTestIDSelector,
    testIDSelector,
    webTestIDSelector,
} from './selector/index.js';
export type {
    ComponentConfigInterface,
    ComponentInputArg,
    ComponentType,
    ComponentWithSelectors,
    ComponentWithSelectorsCtor,
    ElSelectorFn,
    ElsIndexSelectorFn,
    ElsSelectorFn,
    RootedComponentWithSelectors,
    RootedComponentWithSelectorsCtor,
    SelectorContextType,
    SwipeDirectionType,
} from './type/index.js';
export { getTestID, setPropTestID, setTestID } from './util/index.js';
