import type { AndroidBillingAddressParameters } from './android-billing-address-parameters';
import type { AndroidAllowedCardNetworksEnum } from '../../enum/android-allowed-card-networks.enum';

// https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
export interface AndroidPaymentMethodCardParameters {
    // Required for UK Gambling merchants
    allowCreditCards?: boolean;
    allowPrepaidCards?: boolean;
    allowedAuthMethods: AndroidAllowedCardNetworksEnum[];
    allowedCardNetworks: AndroidAllowedCardNetworksEnum[];
    assuranceDetailsRequired?: boolean;
    billingAddressParameters?: AndroidBillingAddressParameters;
    billingAddressRequired?: boolean;
}
