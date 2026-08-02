import { TurboModuleRegistry } from 'react-native';

import type { TurboModule } from 'react-native';

/*
 * TODO: Codegen does not support anything from TS unfortunately
 * https://reactnative.dev/docs/new-architecture-appendix#iii-typescript-to-native-type-mapping
 * Unions do not work, objects do not work, generics do not work, etc.
 */
export interface Spec extends TurboModule {
    abort: () => Promise<void>;
    addListener: (eventName: string) => void;
    canMakePayments: (methodData: string) => Promise<boolean>;
    complete: (paymentComplete: string) => Promise<void>;
    removeListeners: (count: number) => void;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    retry: (requestId: string, errorFields: Object) => Promise<void>;
    setActiveEvents: (requestId: string, eventNames: string[]) => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    show: (requestId: string, methodData: string, details: Object) => Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    updatePaymentDetails: (update: Object, displayItems: Object[], shippingOptions: Object[]) => Promise<void>;
}

// ts-prune-ignore-next
export default TurboModuleRegistry.get<Spec>('Payments');
