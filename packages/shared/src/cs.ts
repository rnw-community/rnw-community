type StyleType = object | undefined | null | false | object[];

/**
 * Conditional styling, returns `styleObj` if `condition` is true.
 *
 * Useful for React Native styles:
 * ```tsx
 * const rootStyles = [
 *  Styles.root,
 *  cs(isActive, Styles.rootActive),
 *  cs(isDisabled, Styles.rootDisabled)
 * ];
 * ```
 *
 * @param condition Boolean condition
 * @param styleObj Styling object
 *
 * @returns styleObj if condition is true otherwise empty object
 */
export const cs = (condition: boolean, styleObj: StyleType) => (condition ? styleObj : {});
