// tslint:disable-next-line:no-import-side-effect
import '../platform.mock';

import * as constants from '../platform';
import { androidStyles, iosStyles, mobileStyles, webStyles } from './platform-style';

describe('Platform styles', () => {
    const styleObj = { backgroundColor: 'red' };

    it('should apply webStyles if platform is WEB', () => {
        // @ts-ignore
        constants.isWeb = true;
        expect(webStyles(styleObj)).toEqual(styleObj);
    });

    it('should apply iosStyles if platform is IOS', () => {
        // @ts-ignore
        constants.isIOS = true;
        expect(iosStyles(styleObj)).toEqual(styleObj);
    });

    it('should apply androidStyles if platform is Android', () => {
        // @ts-ignore
        constants.isAndroid = true;
        expect(androidStyles(styleObj)).toEqual(styleObj);
    });

    it('should apply mobileStyles if platform is Android or IOS', () => {
        // @ts-ignore
        constants.isMobile = true;
        expect(mobileStyles(styleObj)).toEqual(styleObj);
    });
});
