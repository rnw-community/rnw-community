import { describe, expect, it, jest } from '@jest/globals';

import { resolvePaymentsConfig } from '../util/resolve-payments-config/resolve-payments-config.util';

import { withApplePay } from './with-apple-pay';

jest.mock('@expo/config-plugins', () => ({
    withEntitlementsPlist: jest.fn((config: unknown, modifier: (config: unknown) => unknown) => modifier(config)),
}));

const ENTITLEMENT_KEY = 'com.apple.developer.in-app-payments';

const runPlugin = (merchantIdentifier: string | string[], entitlements: Record<string, unknown> = {}) => {
    const config = { name: 'test', slug: 'test', modResults: entitlements };
    const result = withApplePay(config, resolvePaymentsConfig({ merchantIdentifier })) as unknown as {
        modResults: Record<string, string[]>;
    };

    return result.modResults[ENTITLEMENT_KEY];
};

describe('withApplePay', () => {
    it('should add a single merchant identifier', () => {
        expect.assertions(1);

        expect(runPlugin('merchant.com.example')).toStrictEqual(['merchant.com.example']);
    });

    it('should add multiple merchant identifiers', () => {
        expect.assertions(1);

        expect(runPlugin(['merchant.com.example.fr', 'merchant.com.example.mg'])).toStrictEqual([
            'merchant.com.example.fr',
            'merchant.com.example.mg',
        ]);
    });

    it('should preserve already declared merchant identifiers without duplicating them', () => {
        expect.assertions(1);

        const existing = { [ENTITLEMENT_KEY]: ['merchant.com.existing', 'merchant.com.example'] };

        expect(runPlugin(['merchant.com.example', 'merchant.com.example.mg'], existing)).toStrictEqual([
            'merchant.com.existing',
            'merchant.com.example',
            'merchant.com.example.mg',
        ]);
    });

    it('should replace a malformed entitlement value with the merchant identifiers', () => {
        expect.assertions(1);

        expect(runPlugin('merchant.com.example', { [ENTITLEMENT_KEY]: 'merchant.com.example' })).toStrictEqual([
            'merchant.com.example',
        ]);
    });
});
