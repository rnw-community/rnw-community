import { isAndroid } from '@rnw-community/platform';

import { handleNativeCallback } from './handle-callback';

import type { PaymentMethodData } from '../interface/payment-method-data/payment-method-data';
import type { Spec } from '../NativePayments';

export const canMakePayments =
    (nativePayments: Spec) =>
    (methodData: PaymentMethodData): Promise<boolean> =>
        new Promise((resolve, reject) => {
            if (isAndroid) {
                nativePayments.canMakePayments(methodData, handleNativeCallback(resolve, reject, true));
            } else {
                /*
                 * On iOS, canMakePayments is exposed as a constant.
                 * TODO: Cam we make unified API for both platforms?
                 */
                resolve(nativePayments.canMakePayments as unknown as boolean);
            }
        });
