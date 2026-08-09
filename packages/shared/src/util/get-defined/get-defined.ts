import { isDefined } from '../../type-guard/generic/is-defined/is-defined.js';

export const getDefined = <T>(value: T | null | undefined, defaultFn: () => T): T =>
    isDefined(value) ? value : defaultFn();
