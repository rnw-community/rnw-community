export type { OnEventFn } from './type/on-event-fn.type';
export type { Maybe } from './type/maybe.type';

export { cs } from './cs';
export { isDefined } from './is-defined';

// tslint:disable-next-line:no-any
export type EmptyFn = (...args: any[]) => void;
export const emptyFn: EmptyFn = () => void 0;
