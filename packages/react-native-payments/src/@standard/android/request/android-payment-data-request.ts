import { defaultAndroidPaymentMethod } from './android-payment-method';

import type { AndroidAutomaticReloadTransactionInfo } from './android-automatic-reload-transaction-info.interface';
import type { AndroidDeferredTransactionInfo } from './android-deferred-transaction-info.type';
import type { AndroidMerchantInfo } from './android-merchant-info';
import type { AndroidMerchantInitiatedTransactionRequest } from './android-merchant-initiated-transaction-request.type';
import type { AndroidPaymentMethod } from './android-payment-method';
import type { AndroidRecurringTransactionInfo } from './android-recurring-transaction-info.interface';
import type { AndroidShippingAddressParameters } from './android-shipping-address-parameters';
import type { AndroidTransactionInfo } from './android-transaction-info';

/**
 * The Google Pay `PaymentDataRequest` shape, carrying exactly one of the four transaction info objects.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#PaymentDataRequest
 */
export interface AndroidPaymentDataRequest {
    allowedPaymentMethods: AndroidPaymentMethod[];
    apiVersion: 2;
    apiVersionMinor: 0;
    automaticReloadTransactionInfo?: AndroidMerchantInitiatedTransactionRequest<AndroidAutomaticReloadTransactionInfo>;
    deferredTransactionInfo?: AndroidMerchantInitiatedTransactionRequest<AndroidDeferredTransactionInfo>;
    emailRequired?: boolean;
    merchantInfo?: AndroidMerchantInfo;
    recurringTransactionInfo?: AndroidMerchantInitiatedTransactionRequest<AndroidRecurringTransactionInfo>;
    shippingAddressParameters?: AndroidShippingAddressParameters;
    shippingAddressRequired?: boolean;
    transactionInfo?: AndroidTransactionInfo;
}

export const defaultAndroidPaymentDataRequest: AndroidPaymentDataRequest = {
    allowedPaymentMethods: [defaultAndroidPaymentMethod],
    apiVersion: 2,
    apiVersionMinor: 0,
};
