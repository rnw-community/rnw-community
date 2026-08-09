import { defaultAndroidPaymentMethod } from './android-payment-method.js';
import { defaultAndroidTransactionInfo } from './android-transaction-info.js';

import type { AndroidMerchantInfo } from './android-merchant-info.js';
import type { AndroidPaymentMethod } from './android-payment-method.js';
import type { AndroidShippingAddressParameters } from './android-shipping-address-parameters.js';
import type { AndroidTransactionInfo } from './android-transaction-info.js';

/**
 * The Google Pay `PaymentDataRequest` shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#PaymentDataRequest
 */
export interface AndroidPaymentDataRequest {
    allowedPaymentMethods: AndroidPaymentMethod[];
    apiVersion: 2;
    apiVersionMinor: 0;
    emailRequired?: boolean;
    merchantInfo?: AndroidMerchantInfo;
    shippingAddressParameters?: AndroidShippingAddressParameters;
    shippingAddressRequired?: boolean;
    transactionInfo: AndroidTransactionInfo;
}

export const defaultAndroidPaymentDataRequest: AndroidPaymentDataRequest = {
    allowedPaymentMethods: [defaultAndroidPaymentMethod],
    apiVersion: 2,
    apiVersionMinor: 0,
    transactionInfo: defaultAndroidTransactionInfo,
};
