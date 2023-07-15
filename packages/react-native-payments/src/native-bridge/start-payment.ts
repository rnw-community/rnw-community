import { type PaymentOptions, emptyPaymentOptions } from '../interface/payment-options';

import { handleNativeCallback } from './handle-callback';

import type { PaymentDetailsInit } from '../interface/payment-details/payment-details-init';
import type { PaymentMethodData } from '../interface/payment-method-data/payment-method-data';
import type { Spec } from '../NativePayments';

export const startPayment =
    (nativePayments: Spec) =>
    (
        methodData: PaymentMethodData,
        details: PaymentDetailsInit,
        options: PaymentOptions = emptyPaymentOptions
    ): Promise<boolean> =>
        new Promise((resolve, reject) => {
            nativePayments.show(methodData, details, options, handleNativeCallback(resolve, reject, true));
        });
