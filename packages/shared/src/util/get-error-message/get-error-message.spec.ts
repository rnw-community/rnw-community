import { getErrorMessage } from './get-error-message';

describe('get-error-message', () => {
    it('should return error message', () => {
        expect.hasAssertions();
        expect(getErrorMessage(new Error('text'))).toStrictEqual('text');
    });

    it('should return fallback message if first argument is not instance of error', () => {
        expect.hasAssertions();
        expect(getErrorMessage({ message: 'text' }, 'fallbackMessage')).toStrictEqual('fallbackMessage');
    });

    it('should return error message when first argument is error and fallback message is defined', () => {
        expect.hasAssertions();
        expect(getErrorMessage(new Error('text'), 'fallbackMessage')).toStrictEqual('text');
    });
});
