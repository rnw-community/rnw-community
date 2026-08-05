import { describe, expect, it, jest } from '@jest/globals';

import { WebSelectorConfig } from '../../config/index.js';
import { Platform } from '../get-platform/get-platform.util.js';

import { setPropTestID } from './set-prop-test-id.js';

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
