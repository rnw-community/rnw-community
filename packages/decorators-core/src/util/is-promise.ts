export const isPromiseLike = <T>(value: unknown): value is PromiseLike<T> =>
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { readonly then?: unknown }).then === 'function';
