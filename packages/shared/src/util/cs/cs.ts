type StyleType = Record<string, unknown>[] | object | false | null | undefined;

/**
 * Conditional styling helper returning `trueStyle` when `condition` holds, otherwise `falseStyle` or an empty object.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/cs/cs.md
 */
export const cs = (condition: boolean, trueStyle: StyleType, falseStyle?: StyleType): StyleType =>
    condition ? trueStyle : (falseStyle ?? {});
