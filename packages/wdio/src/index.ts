export { addWdioCommands } from './add-wdio-commands';
export { isAndroidCapability } from './capability/is-android.capability';
export { isBrowserCapability } from './capability/is-browser.capability';
export { isIOSCapability } from './capability/is-ios.capability';
export { byIndex$$ } from './command/by-index.command';
export { clearInputCommand } from './command/clear-input.command';
export { openDeepLinkCommand } from './command/mobile/open-deep-link.command';
export { relativeClickCommand } from './command/mobile/relative-click.command';
export { slowInputCommand } from './command/slow-input.command';
export { testID$$Index } from './command/test-id-index.command';
export { testID$ } from './command/test-id.command';
export { testID$$ } from './command/test-ids.command';
export { Component, createComponent, getComponent, getExtendedComponent } from './component';
export { createComponent$ } from './component$/create-component$/create-component$';
export { getComponent$ } from './component$/get-component$/get-component$';
export { getExtendedComponent$ } from './component$/get-exteded-component$/get-extended-component$';
export type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from './interface';
export { createRootedComponent, getExtendedRootedComponent, getRootedComponent, RootedComponent } from './rooted-component';
export { createRootedComponent$ } from './rooted-component$/create-rooted-component$/create-rooted-component$';
export { getExtendedRootedComponent$ } from './rooted-component$/get-extended-rooted-component$/get-extended-rooted-component$';
export { getRootedComponent$ } from './rooted-component$/get-rooted-component$/get-rooted-component$';
export {
    androidTestIDSelector,
    iosTestIDSelector,
    mobileTestIDSelector,
    testIDSelector,
    webTestIDSelector,
} from './selector';
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
} from './type';
export { getTestID, setPropTestID, setTestID } from './util';
