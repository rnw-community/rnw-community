import type { AndroidIntroductoryPeriodInfo } from './android-introductory-period-info.interface';
import type { AndroidMerchantInitiatedTransactionOptions } from './android-merchant-initiated-transaction-options.interface';
import type { AndroidRecurrencePeriodItem } from './android-recurrence-period-item.type';
import type { IsNotEmptyArray } from '@rnw-community/shared';

/**
 * The Google Pay `RecurringTransactionInfo` fields a merchant supplies to enroll the user in a fixed-frequency subscription.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-merchant-initiated-transaction-info.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#RecurringTransactionInfo
 */
export interface AndroidRecurringTransactionInfo extends AndroidMerchantInitiatedTransactionOptions {
    /** A time-bound free or flat-fee period that ends before the first recurrence item starts. */
    introductoryPeriodInfo?: AndroidIntroductoryPeriodInfo;
    /** The billing frequencies and prices of the subscription. */
    recurrenceItems: IsNotEmptyArray<AndroidRecurrencePeriodItem>;
}
