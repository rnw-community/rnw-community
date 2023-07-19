import type { SupportedNetworkEnum } from '../../../enum/supported-networks.enum';

// TODO: Add correct types and links to them, rename?
export interface IOSPaymentMethodData {
    countryCode: string;
    currencyCode: string;
    merchantIdentifier: string;
    supportedNetworks: SupportedNetworkEnum[];
}
