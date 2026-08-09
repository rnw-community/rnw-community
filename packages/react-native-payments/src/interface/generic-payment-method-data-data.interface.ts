import type { PaymentShippingTypeEnum } from '../enum/payment-shipping-type.enum.js';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum.js';

/**
 * Common PaymentMethod data field shared across platforms
 */
export interface GenericPaymentMethodDataDataInterface {
    countryCode?: string;
    currencyCode: string;
    requestBillingAddress?: boolean;
    requestPayerEmail?: boolean;
    requestPayerName?: boolean;
    requestPayerPhone?: boolean;
    requestShipping?: boolean;
    shippingType?: PaymentShippingTypeEnum;
    supportedNetworks: SupportedNetworkEnum[];
}
