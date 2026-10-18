import { TurboModuleRegistry } from 'react-native';

import type { TurboModule } from 'react-native';

export interface Spec extends TurboModule {
    abort: () => Promise<void>;
    addListener: (eventName: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    canMakePayments: (methodData: string, details: Object) => Promise<boolean>;
    complete: (paymentComplete: string) => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    hasEnrolledInstrument: (methodData: string, details: Object) => Promise<boolean>;
    removeListeners: (count: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    retry: (requestId: string, errorFields: Object) => Promise<void>;
    setActiveEvents: (requestId: string, eventNames: string[]) => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    show: (requestId: string, methodData: string, details: Object) => Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    updatePaymentDetails: (update: Object, displayItems: Object[], shippingOptions: Object[]) => Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('Payments');
