import { describe, expect, it } from '@jest/globals';

import { EnvironmentEnum } from '../../enum/environment.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

import { resolvePaymentsConfig } from './resolve-payments-config.util';

const missingMerchantMessage = 'Please provide a non-empty "merchantIdentifier" payments config value';

describe('resolvePaymentsConfig', () => {
    it('should apply every supported network and the PRODUCTION environment by default', () => {
        expect.hasAssertions();

        expect(resolvePaymentsConfig({ merchantIdentifier: 'merchant.com.example' })).toStrictEqual({
            merchantIdentifiers: ['merchant.com.example'],
            supportedNetworks: Object.values(SupportedNetworkEnum),
            googlePayEnvironment: EnvironmentEnum.PRODUCTION,
        });
    });

    it('should accept enum members and their string values alike', () => {
        expect.hasAssertions();

        expect(
            resolvePaymentsConfig({
                merchantIdentifier: 'merchant.com.example',
                supportedNetworks: [SupportedNetworkEnum.Visa, 'masterCard'],
                googlePayEnvironment: 'TEST',
            })
        ).toMatchObject({
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            googlePayEnvironment: EnvironmentEnum.TEST,
        });
    });

    it('should drop empty and duplicated merchant identifiers', () => {
        expect.hasAssertions();

        expect(
            resolvePaymentsConfig({ merchantIdentifier: ['', 'merchant.com.fr', 'merchant.com.fr', 'merchant.com.mg'] })
                .merchantIdentifiers
        ).toStrictEqual(['merchant.com.fr', 'merchant.com.mg']);
    });

    it('should throw when no non-empty merchant identifier is provided', () => {
        expect.hasAssertions();

        expect(() => resolvePaymentsConfig({ merchantIdentifier: '' })).toThrow(missingMerchantMessage);
        expect(() => resolvePaymentsConfig({ merchantIdentifier: [] })).toThrow(missingMerchantMessage);
        expect(() => resolvePaymentsConfig({} as never)).toThrow(missingMerchantMessage);
    });

    it('should throw naming a merchant identifier that is not a string or an array of strings', () => {
        expect.hasAssertions();

        expect(() => resolvePaymentsConfig({ merchantIdentifier: true } as never)).toThrow(
            'Invalid "merchantIdentifier" payments config value: true. Expected a string or an array of strings'
        );
        expect(() => resolvePaymentsConfig({ merchantIdentifier: [true, 'merchant.com.example'] } as never)).toThrow(
            'Invalid "merchantIdentifier" payments config value: [true,"merchant.com.example"]'
        );
    });

    it('should throw naming the invalid supported networks and Google Pay environment', () => {
        expect.hasAssertions();

        expect(() =>
            resolvePaymentsConfig({
                merchantIdentifier: 'merchant.com.example',
                supportedNetworks: ['not-a-network'] as never,
            })
        ).toThrow('Invalid "supportedNetworks" payments config value(s): "not-a-network"');
        expect(() =>
            resolvePaymentsConfig({ merchantIdentifier: 'merchant.com.example', googlePayEnvironment: 'STAGING' as never })
        ).toThrow('Invalid "googlePayEnvironment" payments config value: "STAGING"');
    });

    it('should not share the default supported networks between results', () => {
        expect.hasAssertions();

        resolvePaymentsConfig({ merchantIdentifier: 'merchant.com.example' }).supportedNetworks.pop();

        expect(resolvePaymentsConfig({ merchantIdentifier: 'merchant.com.example' }).supportedNetworks).toStrictEqual(
            Object.values(SupportedNetworkEnum)
        );
    });
});
