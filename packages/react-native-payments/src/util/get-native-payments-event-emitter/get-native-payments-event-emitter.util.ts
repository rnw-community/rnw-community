import { NativeEventEmitter } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { NativePayments } from '../../class/native-payments/native-payments';

import type { PaymentRequestEventPayloadInterface } from '../../interface/payment-request-event-payload.interface';
import type { PaymentRequestEventType } from '../../type/payment-request-event.type';
import type { Maybe } from '@rnw-community/shared';

type NativePaymentsEventEmitter = NativeEventEmitter<
    Readonly<Record<PaymentRequestEventType, readonly [PaymentRequestEventPayloadInterface]>>
>;
type NativeEventEmitterModule = ConstructorParameters<typeof NativeEventEmitter>[0];

let nativePaymentsEventEmitter: Maybe<NativePaymentsEventEmitter> = null;

export const getNativePaymentsEventEmitter = (): Maybe<NativePaymentsEventEmitter> => {
    const { addListener, removeListeners } = NativePayments;

    if (!isDefined(addListener) || !isDefined(removeListeners)) {
        return null;
    }

    nativePaymentsEventEmitter ??= new NativeEventEmitter(NativePayments as unknown as NativeEventEmitterModule);

    return nativePaymentsEventEmitter;
};
