import type { NativePaymentDetailsUpdateInterface } from './native-payment-details-update.interface';
import type { PaymentItem } from '../@standard/w3c/payment-item';
import type { PaymentShippingOption } from '../@standard/w3c/payment-shipping-option';

export interface NativePaymentsChangeEventsInterface {
    addListener?: (eventName: string) => void;
    removeListeners?: (count: number) => void;
    setActiveEvents?: (requestId: string, eventNames: string[]) => Promise<void>;
    updatePaymentDetails?: (
        update: NativePaymentDetailsUpdateInterface,
        displayItems: PaymentItem[],
        shippingOptions: PaymentShippingOption[]
    ) => Promise<void>;
}
