import { isDefined } from "../../type-guard/is-defined/is-defined";

import type { Maybe } from "../../type/maybe.type";

/**
 * Returns value if defined otherwise returns default value
 * 
 * @param value Value to check
 * @param defaultFn Function returning default value
 * @returns Value if defined otherwise default value
 */
export const getDefined = <T>(value:Maybe<T>, defaultFn: () => T ):T => 
    isDefined(value)? value : defaultFn();