import { describe, expect, it, jest } from '@jest/globals';

import { EnvironmentEnum } from '../enum/environment.enum';
import { SupportedNetworkEnum } from '../enum/supported-networks.enum';

import { loadPaymentsConfig } from './load-payments-config/load-payments-config.util';
import { withApplePay } from './with-apple-pay';
import { withGooglePay } from './with-google-pay';
import { withPayments } from './with-payments';

jest.mock('./with-apple-pay', () => ({ withApplePay: jest.fn(config => config) }));
jest.mock('./with-google-pay', () => ({ withGooglePay: jest.fn(config => config) }));
jest.mock('./load-payments-config/load-payments-config.util', () => ({
    loadPaymentsConfig: jest.fn(() => ({ merchantIdentifier: 'merchant.com.file' })),
}));

const resolvedConfig = (merchantIdentifier: string) => ({
    merchantIdentifiers: [merchantIdentifier],
    supportedNetworks: Object.values(SupportedNetworkEnum),
    googlePayEnvironment: EnvironmentEnum.PRODUCTION,
});

describe('withPayments', () => {
    it('should apply both platform plugins with the resolved plugin props', () => {
        expect.assertions(2);

        withPayments(
            { name: 'test', slug: 'test', _internal: { projectRoot: '/project' } },
            { merchantIdentifier: 'merchant.com.example' }
        );

        expect(withApplePay).toHaveBeenCalledWith(expect.anything(), resolvedConfig('merchant.com.example'));
        expect(withGooglePay).toHaveBeenCalledWith(expect.anything(), resolvedConfig('merchant.com.example'));
    });

    it('should fall back to the payments config file of the project root when no props are given', () => {
        expect.assertions(2);

        withPayments({ name: 'test', slug: 'test', _internal: { projectRoot: '/project' } }, undefined);

        expect(loadPaymentsConfig).toHaveBeenLastCalledWith('/project');
        expect(withApplePay).toHaveBeenLastCalledWith(expect.anything(), resolvedConfig('merchant.com.file'));
    });

    it('should look for the payments config file in the working directory without a project root', () => {
        expect.assertions(2);

        expect(() => withPayments({ name: 'test', slug: 'test' }, undefined)).toThrow('_internal.projectRoot');
        expect(loadPaymentsConfig).toHaveBeenLastCalledWith(process.cwd());
    });
});
