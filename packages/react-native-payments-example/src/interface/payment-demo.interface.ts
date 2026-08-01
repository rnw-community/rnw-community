import type { EmptyFn } from '@rnw-community/shared';

export interface PaymentDemoInterface {
    abortRequest: EmptyFn;
    canMakePaymentStatus: string;
    flowState: string;
    resetRequest: EmptyFn;
    showRequest: EmptyFn;
}
