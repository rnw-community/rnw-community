import { isAndroid } from '@rnw-community/platform';
import { isDefined } from '@rnw-community/shared';

import { type PaymentOptions, emptyPaymentOptions } from '../interface/payment-options';

import type { PaymentDetailsInit } from '../interface/payment-details-init';
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
            if (isAndroid) {
                nativePayments.show(methodData, details, options, reject, () => {
                    resolve(true);
                });
            } else {
                nativePayments.show(err => {
                    if (isDefined(err)) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            }
        });
