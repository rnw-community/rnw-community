import type { PaymentShippingTypeEnum } from '../enum/payment-shipping-type.enum';
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
    // https://www.w3.org/TR/payment-request/#dom-paymentoptions-shippingtype; forwarded to PKShippingType on iOS, no-op on Android
    shippingType?: PaymentShippingTypeEnum;
    supportedNetworks: SupportedNetworkEnum[];
}
