import type { AndroidDisplayItem } from './android-display-item.interface';
import type { AndroidMerchantInitiatedPrice } from './android-merchant-initiated-price.type';

/**
 * The Google Pay `RecurrencePeriodItem` request shape describing one billing frequency and price of a recurring charge.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-merchant-initiated-transaction-info.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#RecurrencePeriodItem
 */
export type AndroidRecurrencePeriodItem = AndroidMerchantInitiatedPrice & {
    billingFinalDateTime?: string;
    billingInitialDateTime?: string;
    displayItems?: AndroidDisplayItem[];
    label: string;
    recurrencePeriod: 'DAY' | 'MONTH' | 'WEEK' | 'YEAR';
    recurrencePeriodCount: number;
};
