import { isDefined } from "../../type-guard/is-defined/is-defined";

import type { Maybe } from "../../type/maybe.type";

/**
 * 
 * @param value 
 * @param defaultFn 
 * @returns 
 */
export const getDefined = <T>(value:Maybe<T>, defaultFn: () => T ):T => 
    isDefined(value)? value : defaultFn();