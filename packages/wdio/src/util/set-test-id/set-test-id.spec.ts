import { WebSelectorConfig } from '../../config';
import { Platform } from '../get-platform.util';

import { setTestID } from './set-test-id';

jest.mock('../get-platform.util', () => ({ Platform: { OS: 'web' } }));

describe('setTestID', () => {
    it('should return object with testID prop from WebSelectorConfig for the web', () => {
        expect.assertions(1);

        Platform.OS = 'web';

        expect(setTestID('test')).toMatchObject({ [WebSelectorConfig]: 'test' });
    });
    it('should return object with testID prop for ios', () => {
        expect.assertions(1);

        Platform.OS = 'ios';

        expect(setTestID('test')).toMatchObject({ testID: 'test' });
    });
    it('should return object with testID and accessibilityLabel prop for android', () => {
        expect.assertions(1);

        Platform.OS = 'android';

        expect(setTestID('test')).toMatchObject({ testID: 'test', accessibilityLabel: 'test' });
    });
    it('should modify testID using rest args with underscore', () => {
        expect.assertions(1);

        Platform.OS = 'ios';

        expect(setTestID('test', 'modifier')).toMatchObject({ testID: 'test_modifier' });
    });
});
