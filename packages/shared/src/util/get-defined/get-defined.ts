import { isDefined } from '../../type-guard/generic/is-defined/is-defined';

/**
 * Returns `value` when it is neither `undefined` nor `null`, otherwise the result of the lazily invoked `defaultFn`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/get-defined/get-defined.md
 */
export const getDefined = <T>(value: T | null | undefined, defaultFn: () => T): T =>
    isDefined(value) ? value : defaultFn();
