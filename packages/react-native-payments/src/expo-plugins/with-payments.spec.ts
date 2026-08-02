import { describe, expect, it, jest } from '@jest/globals';

import { withApplePay } from './with-apple-pay';
import { withGooglePay } from './with-google-pay';
import { withPayments } from './with-payments';

jest.mock('./with-apple-pay', () => ({ withApplePay: jest.fn(config => config) }));
jest.mock('./with-google-pay', () => ({ withGooglePay: jest.fn(config => config) }));

const createConfig = () => ({ name: 'test', slug: 'test', _internal: { projectRoot: '/project' } });

describe('withPayments', () => {
    it('should apply withApplePay with the given props', () => {
        expect.assertions(1);

        const props = { merchantIdentifier: 'merchant.com.example' };

        withPayments(createConfig(), props);

        expect(withApplePay).toHaveBeenCalledWith(expect.objectContaining({ name: 'test' }), props);
    });

    it('should apply withGooglePay with the given props', () => {
        expect.assertions(1);

        const props = { merchantIdentifier: 'merchant.com.example' };

        withPayments(createConfig(), props);

        expect(withGooglePay).toHaveBeenCalledWith(expect.objectContaining({ name: 'test' }), props);
    });
});
