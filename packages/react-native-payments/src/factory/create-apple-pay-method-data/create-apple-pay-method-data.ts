import { defaultSupportedNetworks } from '../../constant/default-supported-networks';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';

import type { IosPaymentMethodDataInterface } from '../../@standard/ios/mapping/ios-payment-method-data.interface';
import type { ApplePayMethodDataOptions } from '../../interface/apple-pay-method-data-options.interface';

/**
 * Builds the Apple Pay entry of `methodData` from the merchant-specific fields, defaulting the card networks to Visa and Mastercard.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/create-apple-pay-method-data.md
 * @see https://developer.apple.com/documentation/passkit/pkpaymentrequest
 */
export const createApplePayMethodData = (options: ApplePayMethodDataOptions): IosPaymentMethodDataInterface => ({
    supportedMethods: PaymentMethodNameEnum.ApplePay,
    data: {
        ...options,
        supportedNetworks: options.supportedNetworks ?? [...defaultSupportedNetworks],
    },
});
