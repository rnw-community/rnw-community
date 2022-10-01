export type { SelectorContextType } from './type/selector-context.type';
export type { SwipeDirectionType } from './type/swipe-direction.type';
export type { ElSelectorFn } from './type/el-selector-fn.type';
export type { ElsSelectorFn } from './type/els-selector-fn.type';
export type { ElsIndexSelectorFn } from './type/els-index-selector-fn.type';

export type { WebTestIDProps } from './interface/web-test-id-props.interface';
export type { TestIDProps } from './interface/test-id-props.interface';
export type { AndroidTestIDProps } from './interface/android-test-id-props.interface';

export { androidTestIDSelector } from './selector/android-testid.selector';
export { iosTestIDSelector } from './selector/ios-testid.selector';
export { mobileTestIDSelector } from './selector/mobile-testid.selector';
export { webTestIDSelector } from './selector/web-testid.selector';
export { testIDSelector } from './selector/test-id.selector';

export { setTestID } from './util/set-test-id/set-test-id';
export { getTestID } from './util/get-test-id/get-test-id';
export { setPropTestID } from './util/set-prop-test-id/set-prop-test-id';

export { isAndroidCapability } from './capability/is-android.capability';
export { isBrowserCapability } from './capability/is-browser.capability';
export { isIOSCapability } from './capability/is-ios.capability';

export { testID$ } from './command/test-id.command';
export { testID$$ } from './command/test-ids.command';
export { testID$$Index } from './command/test-id-index.command';
export { slowInputCommand } from './command/slow-input.command';
export { clearInputCommand } from './command/clear-input.command';
export { byIndex$$ } from './command/by-index-command/by-index.command';
export { openDeepLinkCommand } from './command/mobile/open-deep-link.command';
export { relativeClickCommand } from './command/mobile/relative-click.command';

export { Component } from './component/component/component';
export { getExtendedComponent } from './component/component/get-exteded-component/get-extended-component';
export { getComponent } from './component/component/get-component/get-component';
export { get$Component } from './component/component/get$-component/get$-component';
export { createComponent } from './component/component/create-component/create-component';
export { create$Component } from './component/component/create$-component/create$-component';

export { RootedComponent } from './component/rooted-component/rooted-component';
export { getExtendedRootedComponent } from './component/rooted-component/get-extended-rooted-component/get-extended-rooted-component';
export { getRootedComponent } from './component/rooted-component/get-rooted-component/get-rooted-component';
export { get$RootedComponent } from './component/rooted-component/get$-rooted-component/get$-rooted-component';
export { createRootedComponent } from './component/rooted-component/create-rooted-component/create-rooted-component';
export { create$RootedComponent } from './component/rooted-component/create$-rooted-component/create$-rooted-component';

export { addWdioCommands } from './add-wdio-commands';
