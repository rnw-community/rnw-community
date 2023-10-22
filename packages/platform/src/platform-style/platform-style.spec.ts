import '../platform/platform.mock';

import * as constants from '../platform/platform';

import { androidStyles, iosStyles, mobileStyles, webStyles } from './platform-style';

describe('platform styles', () => {
    const styleObj = { backgroundColor: 'red' };

    it('should return empty style if platform does not match', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isWeb = false;
        expect(webStyles(styleObj)).not.toStrictEqual(styleObj);
    });

    it('should apply webStyles if platform is WEB', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isWeb = true;
        expect(webStyles(styleObj)).toStrictEqual(styleObj);
    });

    it('should apply iosStyles if platform is IOS', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isIOS = true;
        expect(iosStyles(styleObj)).toStrictEqual(styleObj);
    });

    it('should apply androidStyles if platform is Android', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isAndroid = true;
        expect(androidStyles(styleObj)).toStrictEqual(styleObj);
    });

    it('should apply mobileStyles if platform is Android or IOS', () => {
        expect.hasAssertions();

        // @ts-expect-error No other way to redefine platform constants
        // eslint-disable-next-line no-import-assign
        constants.isMobile = true;
        expect(mobileStyles(styleObj)).toStrictEqual(styleObj);
    });
});
