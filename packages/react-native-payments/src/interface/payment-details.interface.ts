import type { PaymentDetailsInit } from '../@standard/w3c/payment-details-init';
import type { PaymentItem } from '../@standard/w3c/payment-item';
import type { EnvironmentEnum } from '../enum/environment.enum';

/**
 * ReactNativePayments mapping interface for PaymentDetailsInit, with additional fields.
 * @see PaymentDetailsInit
 */
export interface PaymentDetailsInterface extends PaymentDetailsInit {
    // Android environment https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
    environment: EnvironmentEnum;
    // If present PaymentResponse will have billingAddress
    requestBilling?: boolean;
    // If present PaymentResponse will have email
    requestEmail?: boolean;
    // If present PaymentResponse will have shippingAddress
    requestShipping?: boolean;
    // Android does not have displayItems, and only total field
    total: PaymentItem;
}
