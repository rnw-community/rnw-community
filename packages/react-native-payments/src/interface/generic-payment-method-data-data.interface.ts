import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

/**
 * Common PaymentMethod data field shared across platforms
 */
export interface GenericPaymentMethodDataDataInterface {
    countryCode?: string;
    currencyCode: string;
    // If present PaymentResponse will have billingAddress
    requestBillingAddress?: boolean;
    // If present PaymentResponse will have email
    requestPayerEmail?: boolean;
    // If present PaymentResponse will have name
    requestPayerName?: boolean;
    // If present PaymentResponse will have phone
    requestPayerPhone?: boolean;
    // If present PaymentResponse will have shippingAddress
    requestShipping?: boolean;
    supportedNetworks: SupportedNetworkEnum[];
}
