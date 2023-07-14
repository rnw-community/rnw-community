import { isAndroid } from '@rnw-community/platform';
import { isDefined } from '@rnw-community/shared';

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
                nativePayments.complete(paymentStatus, err => {
                    if (isDefined(err)) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
