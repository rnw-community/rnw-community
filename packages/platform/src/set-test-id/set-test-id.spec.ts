// tslint:disable-next-line:no-import-side-effect
import '../platform.mock';

import * as constants from '../platform';
import { setTestId } from './set-test-id';

describe('setTestId', () => {
    it('should return object only with testID on WEB platform', () => {
        // @ts-ignore
        constants.isWeb = true;
        expect(setTestId('test')).toEqual({ testID: 'test' });
    });

    it('should return object with testID and accessibilityLabel on ANDROID platforms', () => {
        // @ts-ignore
        constants.isWeb = false;
        // @ts-ignore
        constants.isIOS = false;
        expect(setTestId('test')).toEqual({ testID: 'test', accessibilityLabel: 'test' });
    });

    it('should return object with testID and accessibilityLabel on IOS platforms', () => {
        // @ts-ignore
        constants.isWeb = false;
        // @ts-ignore
        constants.isIOS = true;
        expect(setTestId('test')).toEqual({ testID: 'test' });
    });
});
