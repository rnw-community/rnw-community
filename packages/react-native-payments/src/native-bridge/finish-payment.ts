import { isAndroid } from '@rnw-community/platform';

import { handleNativeCallback } from './handle-callback';

import type { PaymentComplete } from '../enum/payment-complete.enum';
import type { Spec } from '../NativePayments';

export const finishPayment =
    (nativePayments: Spec) =>
    (paymentStatus: PaymentComplete): Promise<void> =>
        new Promise((resolve, reject) => {
            // Android doesn't have a loading state, so we noop.
            if (isAndroid) {
                resolve();
            } else {
                nativePayments.complete(paymentStatus, handleNativeCallback(resolve, reject, void 0));
            }
        });
