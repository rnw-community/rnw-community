import type { SupportedNetworkEnum } from '../../enum/supported-networks.enum';
import type { PaymentItem } from '../payment-item';

// https://www.w3.org/TR/payment-request/#paymentdetailsmodifier-dictionary
export interface PaymentDetailsModifier {
    additionalDisplayItems: PaymentItem[];
    // TODO: Add type
    data: Record<string, string>;
    supportedMethods: SupportedNetworkEnum[];
}
