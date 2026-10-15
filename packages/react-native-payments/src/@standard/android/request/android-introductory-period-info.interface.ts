import type { AndroidDisplayItem } from './android-display-item.interface';

/**
 * The Google Pay `IntroductoryPeriodInfo` request shape describing a free or flat-fee period before a recurring charge starts.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-merchant-initiated-transaction-info.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#IntroductoryPeriodInfo
 */
export interface AndroidIntroductoryPeriodInfo {
    /** Line items that compose the introductory period. */
    displayItems?: AndroidDisplayItem[];
    /** The RFC 3339 end of the introductory service period. */
    introductoryPeriodEndDateTime: string;
    /** The RFC 3339 start of the introductory service period, omitted when it starts immediately. */
    introductoryPeriodStartDateTime?: string;
    /** A short label of at most 100 characters, such as `7 Day Free Trial`. */
    label: string;
    /** The price of the introductory period, `'0.00'` for a free period. */
    totalPrice: string;
}
