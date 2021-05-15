import { isAndroid, isWeb } from './platform';

/**
 * Get WEB, IOS and Android supported object with `testID` props.
 *
 * Method support oped-ended args for test identifiers useful for dynamically
 * generated components.
 *
 * @params {...string} Test identifiers
 * @returns Concatenated Test identifiers using `_` symbol
 */
export const setTestId = (...args: Array<string | number>) => {
    const id = args.join('_');

    return isWeb ? { testID: id } : isAndroid ? { accessibilityLabel: id, testID: id } : { testID: id };
};
