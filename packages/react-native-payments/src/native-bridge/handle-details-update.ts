import { isAndroid } from '@rnw-community/platform';
import { isDefined } from '@rnw-community/shared';

import type { PaymentDetailsUpdate } from '../interface/payment-details-update';
import type { Spec } from '../NativePayments';

export const handleDetailsUpdate =
    (nativePayments: Spec) =>
    (details: PaymentDetailsUpdate): Promise<void> =>
        new Promise((resolve, reject) => {
            /*
             * Android doesn't have display items, so we noop.
             * Users need to create a new Payment Request if they
             * need to update pricing.
             */
            if (isAndroid) {
                resolve();
            } else {
                nativePayments.handleDetailsUpdate(details, err => {
                    if (isDefined(err)) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
