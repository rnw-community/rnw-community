import type { AndroidBillingAddressParameters } from './android-billing-address-parameters.js';
import type { AndroidAllowedAuthMethodsEnum } from '../enum/android-allowed-auth-methods.enum.js';
import type { AndroidAllowedCardNetworksEnum } from '../enum/android-allowed-card-networks.enum.js';

/**
 * The Google Pay `CardParameters` request shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
 */
export interface AndroidPaymentMethodCardParameters {
    allowCreditCards?: boolean;
    allowPrepaidCards?: boolean;
    allowedAuthMethods: AndroidAllowedAuthMethodsEnum[];
    allowedCardNetworks: AndroidAllowedCardNetworksEnum[];
    assuranceDetailsRequired?: boolean;
    billingAddressParameters?: AndroidBillingAddressParameters;
    billingAddressRequired?: boolean;
}
