import { isDefined } from '../../type-guard/generic/is-defined/is-defined';

export const getDefinedAsync = <T>(value: T | null | undefined, defaultFn: () => Promise<T>): Promise<T> =>
    isDefined(value) ? Promise.resolve(value) : defaultFn();
