/**
 * A single-argument callback type taking an event of type `T` and returning `R`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/on-event-fn-type/on-event-fn.type.md
 */
export type OnEventFn<T = object, R = void> = (event: T) => R;
