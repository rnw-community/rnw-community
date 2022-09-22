import { WebSelectorConfig } from '../../config';
import { Platform } from '../get-platform/get-platform.util';

import { setPropTestID } from './set-prop-test-id';

jest.mock('../get-platform/get-platform.util', () => ({ Platform: { OS: 'web' } }));

describe('setPropTestID', () => {
    it('should read testID prop and return object with testID prop from WebSelectorConfig for the web', () => {
        expect.assertions(1);

        Platform.OS = 'web';

        const props = { [WebSelectorConfig]: 'test' };

        expect(setPropTestID('default', props)).toMatchObject({ [WebSelectorConfig]: 'test' });
    });

    it('should read testID prop and return object with testID prop for ios', () => {
        expect.assertions(1);

        Platform.OS = 'ios';

        const props = { testID: 'test' };

        expect(setPropTestID('default', props)).toMatchObject({ testID: 'test' });
    });

    it('should use default testID if prop testID is undefined and return object with testID prop for ios', () => {
        expect.assertions(1);

        Platform.OS = 'ios';

        const props = {};

        expect(setPropTestID('default', props)).toMatchObject({ testID: 'default' });
    });
});
