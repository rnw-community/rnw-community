import { TurboModuleRegistry } from 'react-native';

import type { PaymentComplete } from './enum/payment-complete.enum';
import type { CanMakePaymentsMethodDataInterface } from './interface/can-make-payments-method-data.interface';
import type { PaymentDetailsInit } from './interface/payment-details-init';
import type { PaymentDetailsUpdate } from './interface/payment-details-update';
import type { PaymentMethodData } from './interface/payment-method-data/payment-method-data';
import type { PaymentOptions } from './interface/payment-options';
import type { OnEventFn } from '@rnw-community/shared';
import type { TurboModule } from 'react-native';

// TODO: Platform implementation differs significantly - we need improving it
export interface Spec extends TurboModule {
    abort: (callback: OnEventFn<Error | undefined>) => void;
    canMakePayments: (methodData?: CanMakePaymentsMethodDataInterface, onError?: OnEventFn, onSuccess?: OnEventFn) => void;
    complete: (paymentComplete: PaymentComplete, callback: OnEventFn<Error | undefined>) => void;
    createPaymentRequest: (
        methodData: PaymentMethodData,
        details: PaymentDetailsInit,
        options?: PaymentOptions,
        callback?: OnEventFn<Error | undefined>
    ) => void;
    handleDetailsUpdate: (details: PaymentDetailsUpdate, callback: OnEventFn<Error | undefined>) => void;
    show: (
        methodData: OnEventFn<Error | undefined> | PaymentMethodData,
        details?: PaymentDetailsInit,
        options?: PaymentOptions,
        onError?: OnEventFn,
        onSuccess?: OnEventFn
    ) => void;
    supportedGateways: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
export default TurboModuleRegistry.getEnforcing<Spec>('Payments');
