import { describe, expect, it } from '@jest/globals';

import { AndroidAllowedAuthMethodsEnum } from '../../@standard/android/enum/android-allowed-auth-methods.enum';
import { EnvironmentEnum } from '../../enum/environment.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

import { createGooglePayMethodData } from './create-google-pay-method-data';

describe('createGooglePayMethodData', () => {
    const gatewayConfig = { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' };

    it('should build Google Pay method data with the TEST environment and Visa and Mastercard by default', () => {
        expect.hasAssertions();

        expect(createGooglePayMethodData({ countryCode: 'US', currencyCode: 'USD', gatewayConfig })).toStrictEqual({
            supportedMethods: PaymentMethodNameEnum.AndroidPay,
            data: {
                countryCode: 'US',
                currencyCode: 'USD',
                gatewayConfig,
                environment: EnvironmentEnum.TEST,
                supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            },
        });
    });

    it('should keep provided environment, supportedNetworks and every other option', () => {
        expect.hasAssertions();

        const options = {
            currencyCode: 'EUR',
            directConfig: { protocolVersion: 'ECv2', publicKey: 'publicKey' },
            environment: EnvironmentEnum.PRODUCTION,
            supportedNetworks: [SupportedNetworkEnum.Amex],
            allowedAuthMethods: [AndroidAllowedAuthMethodsEnum.CRYPTOGRAM_3DS],
            requestShipping: true,
        };

        expect(createGooglePayMethodData(options).data).toStrictEqual(options);
    });

    it('should not share the default supportedNetworks array between results', () => {
        expect.hasAssertions();

        const first = createGooglePayMethodData({ currencyCode: 'USD', gatewayConfig });
        first.data.supportedNetworks.push(SupportedNetworkEnum.Amex);

        expect(createGooglePayMethodData({ currencyCode: 'USD', gatewayConfig }).data.supportedNetworks).toStrictEqual([
            SupportedNetworkEnum.Visa,
            SupportedNetworkEnum.Mastercard,
        ]);
    });
});
