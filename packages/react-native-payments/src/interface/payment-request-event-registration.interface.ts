import type { PaymentRequestEventListener } from '../type/payment-request-event-listener.type';
import type { Maybe } from '@rnw-community/shared';
import type { EmitterSubscription } from 'react-native';

export interface PaymentRequestEventRegistrationInterface {
    listeners: PaymentRequestEventListener[];
    subscription: Maybe<EmitterSubscription>;
}
