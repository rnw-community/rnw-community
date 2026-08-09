import { isDefined } from '../../type-guard/generic/is-defined/is-defined';

/**
 * Returns value if defined otherwise returns default value
 *
 * @param value Value to check
 * @param defaultFn Function returning default value
 * @returns Value if defined otherwise default value
 */
export const getDefined = <T>(value: T | null | undefined, defaultFn: () => T): T =>
    isDefined(value) ? value : defaultFn();
