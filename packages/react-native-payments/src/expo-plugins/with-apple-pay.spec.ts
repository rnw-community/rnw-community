import { describe, expect, it, jest } from '@jest/globals';

import { EnvironmentEnum } from '../enum/environment.enum';
import { SupportedNetworkEnum } from '../enum/supported-networks.enum';

import { withApplePay } from './with-apple-pay';

import type { ReactNativePaymentsPluginProps } from './plugin.props';

jest.mock('@expo/config-plugins', () => ({
    withEntitlementsPlist: jest.fn((config: unknown, modifier: (config: unknown) => unknown) => modifier(config)),
}));

const ENTITLEMENT_KEY = 'com.apple.developer.in-app-payments';

const createConfig = (entitlements: Record<string, unknown> = {}) => ({
    name: 'test',
    slug: 'test',
    modResults: entitlements,
});

const runPlugin = (merchantIdentifier: string | string[], entitlements?: Record<string, unknown>) => {
    const result = withApplePay(createConfig(entitlements), { merchantIdentifier }) as unknown as {
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

    it('should preserve already declared merchant identifiers', () => {
        expect.assertions(1);

        const existing = { [ENTITLEMENT_KEY]: ['merchant.com.existing'] };

        expect(runPlugin('merchant.com.example', existing)).toStrictEqual(['merchant.com.existing', 'merchant.com.example']);
    });

    it('should not duplicate an already declared merchant identifier', () => {
        expect.assertions(1);

        const existing = { [ENTITLEMENT_KEY]: ['merchant.com.example'] };

        expect(runPlugin(['merchant.com.example', 'merchant.com.example.mg'], existing)).toStrictEqual([
            'merchant.com.example',
            'merchant.com.example.mg',
        ]);
    });

    it('should ignore empty identifiers', () => {
        expect.assertions(1);

        expect(runPlugin(['', 'merchant.com.example'])).toStrictEqual(['merchant.com.example']);
    });

    it('should throw when no merchant identifier is provided', () => {
        expect.assertions(1);

        expect(() => withApplePay(createConfig() as never, {} as never)).toThrow(
            'Please provide "@rnw-community/react-native-payments" plugin option "merchantIdentifier"'
        );
    });

    it('should ignore Google Pay-only options and keep entitling the given merchant identifier', () => {
        expect.assertions(1);

        const props: ReactNativePaymentsPluginProps = {
            merchantIdentifier: 'merchant.com.example',
            supportedNetworks: [SupportedNetworkEnum.Visa],
            googlePayEnvironment: EnvironmentEnum.TEST,
        };

        const result = withApplePay(createConfig(), props) as unknown as { modResults: Record<string, string[]> };

        expect(result.modResults[ENTITLEMENT_KEY]).toStrictEqual(['merchant.com.example']);
    });

    it('should throw when every provided identifier is empty', () => {
        expect.assertions(3);

        expect(() => runPlugin('')).toThrow(
            'Please provide "@rnw-community/react-native-payments" plugin option "merchantIdentifier"'
        );
        expect(() => runPlugin([])).toThrow(
            'Please provide "@rnw-community/react-native-payments" plugin option "merchantIdentifier"'
        );
        expect(() => runPlugin([''])).toThrow(
            'Please provide "@rnw-community/react-native-payments" plugin option "merchantIdentifier"'
        );
    });
});
