import type { AndroidDisplayItem } from './android-display-item.interface';

export interface AndroidMerchantInitiatedTransactionOptions {
    billingAgreement?: string;
    immediateDisplayItems?: AndroidDisplayItem[];
    managementUrl?: string;
    tokenUpdateUrl?: string;
}
