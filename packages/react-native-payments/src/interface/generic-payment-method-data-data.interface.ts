import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

/**
 * Common PaymentMethod data field shared across platforms
 */
export interface GenericPaymentMethodDataDataInterface {
    countryCode?: string;
    currencyCode: string;
    // If present PaymentResponse will have billingAddress
    requestBilling?: boolean;
    // If present PaymentResponse will have email
    requestEmail?: boolean;
    // If present PaymentResponse will have shippingAddress
    requestShipping?: boolean;
    supportedNetworks: SupportedNetworkEnum[];
}
