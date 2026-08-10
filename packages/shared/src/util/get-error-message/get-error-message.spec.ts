import { describe, expect, it } from '@jest/globals';

import { getErrorMessage } from './get-error-message';

describe('get-error-message', () => {
    it('should return error message', () => {
        expect.hasAssertions();
        expect(getErrorMessage(new Error('text'))).toBe('text');
    });

    it('should return fallback message if first argument is not instance of error', () => {
        expect.hasAssertions();
        expect(getErrorMessage({ message: 'text' }, 'fallbackMessage')).toBe('fallbackMessage');
    });

    it('should return error message when first argument is error and fallback message is defined', () => {
        expect.hasAssertions();
        expect(getErrorMessage(new Error('text'), 'fallbackMessage')).toBe('text');
    });
});
