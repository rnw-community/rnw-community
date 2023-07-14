import { isAndroid } from '@rnw-community/platform';

import type { Spec } from '../NativePayments';

export const getSupportedGateways = (nativePayments: Spec): string[] => {
    // On Android, Payment Gateways are supported out of the gate.
    if (isAndroid) {
        return [];
    }

    return nativePayments.supportedGateways;
};
