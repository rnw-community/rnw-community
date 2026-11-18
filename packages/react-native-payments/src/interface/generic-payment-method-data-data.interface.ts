import type { PaymentShippingTypeEnum } from '../enum/payment-shipping-type.enum';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

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
    /** The ISO 3166-1 alpha-2 codes of the card issuer countries accepted by the sheet: PassKit `supportedCountries`, Google Pay `allowedIssuerCountryCodes`. */
    supportedCountries?: string[];
    supportedNetworks: SupportedNetworkEnum[];
}
