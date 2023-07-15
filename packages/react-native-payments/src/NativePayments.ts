import { TurboModuleRegistry } from 'react-native';

import type { PaymentComplete } from './enum/payment-complete.enum';
import type { NativeErrorInterface } from './interface/native-error.interface';
import type { PaymentDetailsInit } from './interface/payment-details/payment-details-init';
import type { PaymentDetailsUpdate } from './interface/payment-details/payment-details-update';
import type { PaymentMethodData } from './interface/payment-method-data/payment-method-data';
import type { PaymentOptions } from './interface/payment-options';
import type { TurboModule } from 'react-native';

// TODO: Platform implementation differs significantly - we need improving it
export interface Spec extends TurboModule {
    abort: (callback: (error?: NativeErrorInterface) => void) => void;
    canMakePayments: (methodData: PaymentMethodData, callback: (error?: NativeErrorInterface) => void) => void;
    complete: (paymentComplete: PaymentComplete, callback: (error?: NativeErrorInterface) => void) => void;
    createPaymentRequest: (
        methodData: PaymentMethodData,
        details: PaymentDetailsInit,
        options: PaymentOptions,
        callback: (error?: NativeErrorInterface) => void
    ) => void;
    handleDetailsUpdate: (details: PaymentDetailsUpdate, callback: (error?: NativeErrorInterface) => void) => void;
    show: (
        methodData: PaymentMethodData,
        details: PaymentDetailsInit,
        options: PaymentOptions,
        callback: (error?: NativeErrorInterface) => void
    ) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Payments');
