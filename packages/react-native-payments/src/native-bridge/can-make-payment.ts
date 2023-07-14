import { isAndroid } from '@rnw-community/platform';

import type { CanMakePaymentsMethodDataInterface } from '../interface/can-make-payments-method-data.interface';
import type { Spec } from '../NativePayments';

export const canMakePayments =
    (nativePayments: Spec) =>
    (methodData?: CanMakePaymentsMethodDataInterface): Promise<boolean> =>
        new Promise((resolve, reject) => {
            if (isAndroid) {
                nativePayments.canMakePayments(methodData, reject, () => void resolve(true));
            } else {
                /*
                 * On iOS, canMakePayments is exposed as a constant.
                 * TODO: Cam we make unified API for both platforms?
                 */
                resolve(nativePayments.canMakePayments as unknown as boolean);
            }
        });
