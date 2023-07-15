import { isAndroid } from '@rnw-community/platform';

import { handleNativeCallback } from './handle-callback';

import type { Spec } from '../NativePayments';

export const abortPayment = (nativePayments: Spec) => (): Promise<boolean> =>
    new Promise((resolve, reject) => {
        if (isAndroid) {
            // TODO: Implement android
            resolve(true);
        } else {
            nativePayments.abort(handleNativeCallback(resolve, reject, true));
        }
    });
