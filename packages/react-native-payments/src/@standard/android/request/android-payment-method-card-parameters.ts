import type { AndroidBillingAddressParameters } from './android-billing-address-parameters';
import type { AndroidAllowedAuthMethodsEnum } from '../enum/android-allowed-auth-methods.enum';
import type { AndroidAllowedCardNetworksEnum } from '../enum/android-allowed-card-networks.enum';

// https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
export interface AndroidPaymentMethodCardParameters {
    // Required for UK Gambling merchants
    allowCreditCards?: boolean;
    allowPrepaidCards?: boolean;
    allowedAuthMethods: AndroidAllowedAuthMethodsEnum[];
    allowedCardNetworks: AndroidAllowedCardNetworksEnum[];
    assuranceDetailsRequired?: boolean;
    billingAddressParameters?: AndroidBillingAddressParameters;
    billingAddressRequired?: boolean;
}
