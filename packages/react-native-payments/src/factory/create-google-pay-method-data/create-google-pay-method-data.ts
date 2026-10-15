import { defaultSupportedNetworks } from '../../constant/default-supported-networks';
import { EnvironmentEnum } from '../../enum/environment.enum';
import { PaymentMethodNameEnum } from '../../enum/payment-method-name.enum';

import type { AndroidPaymentMethodDataInterface } from '../../@standard/android/mapping/android-payment-method-data.interface';
import type { GooglePayMethodDataOptions } from '../../type/google-pay-method-data-options.type';

/**
 * Builds the Google Pay entry of `methodData` from the merchant-specific fields, defaulting to the TEST environment and Visa and Mastercard.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/create-google-pay-method-data.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#PaymentDataRequest
 */
export const createGooglePayMethodData = (options: GooglePayMethodDataOptions): AndroidPaymentMethodDataInterface => ({
    supportedMethods: PaymentMethodNameEnum.AndroidPay,
    data: {
        ...options,
        environment: options.environment ?? EnvironmentEnum.TEST,
        supportedNetworks: options.supportedNetworks ?? [...defaultSupportedNetworks],
    },
});
