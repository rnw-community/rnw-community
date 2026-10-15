import { isDefined } from '@rnw-community/shared';

import { defaultAndroidTransactionInfo } from '../@standard/android/request/android-transaction-info';

import type { AndroidPaymentMethodDataDataInterface } from '../@standard/android/mapping/android-payment-method-data-data.interface';
import type { AndroidPaymentDataRequest } from '../@standard/android/request/android-payment-data-request';
import type { PaymentItem } from '../@standard/w3c/payment-item';

type AndroidBillingIntentRequest = Pick<
    AndroidPaymentDataRequest,
    'automaticReloadTransactionInfo' | 'deferredTransactionInfo' | 'recurringTransactionInfo' | 'transactionInfo'
>;

export const getAndroidBillingIntent = (
    methodData: AndroidPaymentMethodDataDataInterface,
    total: PaymentItem
): AndroidBillingIntentRequest => {
    const merchantInitiatedTransactionBase = {
        countryCode: methodData.countryCode,
        currencyCode: methodData.currencyCode,
        immediateTotalPrice: total.amount.value,
        ...(isDefined(methodData.transactionId) && { transactionId: methodData.transactionId }),
    };

    if (isDefined(methodData.deferredTransactionInfo)) {
        return { deferredTransactionInfo: { ...methodData.deferredTransactionInfo, ...merchantInitiatedTransactionBase } };
    }

    if (isDefined(methodData.recurringTransactionInfo)) {
        return { recurringTransactionInfo: { ...methodData.recurringTransactionInfo, ...merchantInitiatedTransactionBase } };
    }

    if (isDefined(methodData.automaticReloadTransactionInfo)) {
        return {
            automaticReloadTransactionInfo: {
                ...methodData.automaticReloadTransactionInfo,
                ...merchantInitiatedTransactionBase,
            },
        };
    }

    return {
        transactionInfo: {
            ...defaultAndroidTransactionInfo,
            currencyCode: methodData.currencyCode,
            totalPrice: total.amount.value,
            totalPriceLabel: total.label,
            countryCode: methodData.countryCode,
            totalPriceStatus: methodData.totalPriceStatus ?? defaultAndroidTransactionInfo.totalPriceStatus,
            ...(isDefined(methodData.checkoutOption) && { checkoutOption: methodData.checkoutOption }),
            ...(isDefined(methodData.transactionId) && { transactionId: methodData.transactionId }),
        },
    };
};
