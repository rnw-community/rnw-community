// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-invalid-void-type
export type OnEventFn<T = object, R = void> = (event: T) => R;
