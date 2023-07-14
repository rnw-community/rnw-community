import { isAndroid } from '@rnw-community/platform';
import { isDefined } from '@rnw-community/shared';

import type { Spec } from '../NativePayments';

export const abortPayment = (nativePayments: Spec) => (): Promise<boolean> =>
    new Promise((resolve, reject) => {
        if (isAndroid) {
            // TODO: Implement android
            resolve(true);
        } else {
            nativePayments.abort(err => {
                if (isDefined(err)) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        }
    });
