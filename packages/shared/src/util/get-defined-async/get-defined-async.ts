import { isDefined } from '../../type-guard/is-defined/is-defined';

import type { Maybe } from '../../type/maybe.type';

export const getDefinedAsync = <T>(value: Maybe<T>, defaultFn: () => Promise<T>): Promise<T> =>
    isDefined(value) ? Promise.resolve(value) : defaultFn();
