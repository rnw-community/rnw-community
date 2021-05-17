// eslint-disable-next-line @typescript-eslint/no-invalid-void-type, @typescript-eslint/no-explicit-any
export type OnEventFn<T = Record<string, unknown>, R = void> = (event: T) => R;
