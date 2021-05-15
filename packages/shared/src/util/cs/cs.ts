// eslint-disable-next-line @typescript-eslint/ban-types
type StyleType = Array<Record<string, unknown>> | object | false | null | undefined;

/**
 * Conditional styling, returns `trueStyle` object if `condition` is true,
 * otherwise returns `falseStyle` object which defaults to `{}`.
 *
 * @param condition Boolean condition
 * @param trueStyle Styling object
 * @param falseStyle Styling object, empty object by default
 *
 * @returns `trueStyle` if condition is _true_ otherwise `falseStyle`
 */
export const cs = (condition: boolean, trueStyle: StyleType, falseStyle?: StyleType): StyleType =>
    condition ? trueStyle : falseStyle ?? {};
