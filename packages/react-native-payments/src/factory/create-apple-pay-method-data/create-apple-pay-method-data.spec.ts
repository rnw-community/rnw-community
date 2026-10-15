import { describe, expect, it } from '@jest/globals';

import { IosPKMerchantCapability } from '../../@standard/ios/enum/ios-pk-merchant-capability.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

import { createApplePayMethodData } from './create-apple-pay-method-data';

describe('createApplePayMethodData', () => {
    const requiredOptions = {
        merchantIdentifier: 'merchant.com.example',
        countryCode: 'US',
        currencyCode: 'USD',
    };

    it('should build Apple Pay method data with Visa and Mastercard by default', () => {
        expect.hasAssertions();

        expect(createApplePayMethodData(requiredOptions)).toStrictEqual({
            supportedMethods: PaymentMethodNameEnum.ApplePay,
            data: {
                ...requiredOptions,
                supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
            },
        });
    });

    it('should keep provided supportedNetworks and every other option', () => {
        expect.hasAssertions();

        const options = {
            ...requiredOptions,
            supportedNetworks: [SupportedNetworkEnum.Amex],
            merchantCapabilities: [IosPKMerchantCapability.PKMerchantCapability3DS],
            requestPayerEmail: true,
        };

        expect(createApplePayMethodData(options).data).toStrictEqual(options);
    });

    it('should not share the default supportedNetworks array between results', () => {
        expect.hasAssertions();

        const first = createApplePayMethodData(requiredOptions);
        first.data.supportedNetworks.push(SupportedNetworkEnum.Amex);

        expect(createApplePayMethodData(requiredOptions).data.supportedNetworks).toStrictEqual([
            SupportedNetworkEnum.Visa,
            SupportedNetworkEnum.Mastercard,
        ]);
    });
});
