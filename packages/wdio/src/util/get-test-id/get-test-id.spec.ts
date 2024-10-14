import { describe, expect, it, jest } from '@jest/globals';

import { WebSelectorConfig } from '../../config';
import { Platform } from '../get-platform/get-platform.util';

import { getTestID } from './get-test-id';

jest.mock('../get-platform/get-platform.util', () => ({ Platform: { OS: 'web' } }));

describe('getTestID', () => {
    it('should return testID prop from WebSelectorConfig for the web', () => {
        expect.assertions(1);

        Platform.OS = 'web';

        const props = { [WebSelectorConfig]: 'test' };

        expect(getTestID(props)).toBe('test');
    });

    it('should return testID prop for the react-native', () => {
        expect.assertions(1);

        Platform.OS = 'ios';

        const props = { testID: 'test' };

        expect(getTestID(props)).toBe('test');
    });

    it('should return default testID if props does not have it', () => {
        expect.assertions(1);

        Platform.OS = 'ios';

        const props = {};

        expect(getTestID(props, 'default')).toBe('default');
    });
});
