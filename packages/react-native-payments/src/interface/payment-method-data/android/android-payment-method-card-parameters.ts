import type { AndroidBillingAddressParameters } from './android-billing-address-parameters';

// https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
export interface AndroidPaymentMethodCardParameters {
    // Required for UK Gambling merchants
    allowCreditCards?: boolean;
    allowPrepaidCards?: boolean;
    allowedAuthMethods: Array<'CRYPTOGRAM_3DS' | 'PAN_ONLY'>;
    // TODO: This should match SupportedNetworkEnum, register is different between IOS and Android
    allowedCardNetworks: Array<'AMEX' | 'MASTERCARD' | 'VISA'>;
    assuranceDetailsRequired?: boolean;
    billingAddressParameters?: AndroidBillingAddressParameters;
    billingAddressRequired?: boolean;
}
