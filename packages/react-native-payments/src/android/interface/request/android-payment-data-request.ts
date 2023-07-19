import type { AndroidMerchantInfo } from './android-merchant-info';
import type { AndroidPaymentMethod } from './android-payment-method';
import type { AndroidShippingAddressParameters } from './android-shipping-address-parameters';
import type { AndroidTransactionInfo } from './android-transaction-info';

// https://developers.google.com/pay/api/android/reference/request-objects#PaymentDataRequest
export interface AndroidPaymentDataRequest {
    allowedPaymentMethods: AndroidPaymentMethod[];
    apiVersion: 2;
    apiVersionMinor: 0;
    emailRequired?: boolean;
    merchantInfo: AndroidMerchantInfo;
    shippingAddressParameters?: AndroidShippingAddressParameters;
    shippingAddressRequired?: boolean;
    transactionInfo: AndroidTransactionInfo;
}
