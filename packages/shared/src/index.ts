export type { OnEventFn } from './type/on-event-fn.type';
export type { Maybe } from './type/maybe.type';

export { cs } from './cs';
export { isDefined } from './is-defined';
export { webStyles, mobileStyles, iosStyles, androidStyles } from './platform-style';
export { isWeb, isAndroid, isIOS, isMobile } from './platform';
export { setTestId } from './set-test-id';

// tslint:disable-next-line:no-any
export type EmptyFn = (...args: any[]) => void;
export const emptyFn: EmptyFn = () => void 0;
