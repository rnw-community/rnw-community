import { isIOS, isWeb } from '../platform';

/**
 * Get WEB, IOS and Android supported object with `testID` props.
 *
 * Method support oped-ended args for test identifiers useful for dynamically
 * generated components.
 *
 * @params {...string} Test identifiers
 * @returns Concatenated Test identifiers using `_` symbol
 */
export const setTestId = (
    ...args: Array<number | string>
): { accessibilityLabel: string; testID: string } | { testID: string } => {
    const id = args.join('_');

    return isWeb || isIOS ? { testID: id } : { accessibilityLabel: id, testID: id };
};
