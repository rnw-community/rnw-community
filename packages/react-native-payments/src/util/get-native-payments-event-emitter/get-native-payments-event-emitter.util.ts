import { NativeEventEmitter } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { NativePayments } from '../../class/native-payments/native-payments';

import type { Maybe } from '@rnw-community/shared';
import type { NativeModule } from 'react-native';

let nativePaymentsEventEmitter: Maybe<NativeEventEmitter> = null;

export const getNativePaymentsEventEmitter = (): Maybe<NativeEventEmitter> => {
    const { addListener, removeListeners } = NativePayments;

    if (!isDefined(addListener) || !isDefined(removeListeners)) {
        return null;
    }

    nativePaymentsEventEmitter ??= new NativeEventEmitter(NativePayments as unknown as NativeModule);

    return nativePaymentsEventEmitter;
};
