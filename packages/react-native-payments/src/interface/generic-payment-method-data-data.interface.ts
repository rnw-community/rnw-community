import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

/**
 * Common PaymentMethod data field shared across platforms
 */
export interface GenericPaymentMethodDataDataInterface {
    countryCode?: string;
    currencyCode: string;
    supportedNetworks: SupportedNetworkEnum[];
}
