import '../platform/platform.mock';

import * as constants from '../platform/platform';

import { setTestId } from './set-test-id';

describe('setTestId', () => {
    it('should return object only with testID on WEB platform', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isWeb = true;
        expect(setTestId('test')).toStrictEqual({ 'data-test-id': 'test' });
    });

    it('should return object with testID and accessibilityLabel on ANDROID platforms', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isWeb = false;
        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isIOS = false;
        expect(setTestId('test')).toStrictEqual({ testID: 'test', accessibilityLabel: 'test' });
    });

    it('should return object with testID and accessibilityLabel on IOS platforms', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isWeb = false;
        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isIOS = true;
        expect(setTestId('test')).toStrictEqual({ testID: 'test' });
    });
});
