import type { PaymentDetailsBase } from './payment-details-base';
import type { PaymentItem } from './payment-item';
import type { EnvironmentEnum } from '../../enum/environment.enum';

// https://www.w3.org/TR/payment-request/#paymentdetailsinit-dictionary
export interface PaymentDetailsInit extends PaymentDetailsBase {
    // Android environment https://developers.google.com/android/reference/com/google/android/gms/wallet/Wallet.WalletOptions.Builder#setEnvironment(int)
    environment: EnvironmentEnum;
    id?: string;
    total: PaymentItem;
}
