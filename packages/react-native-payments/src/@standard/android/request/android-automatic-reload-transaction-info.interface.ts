import type { AndroidMerchantInitiatedTransactionOptions } from './android-merchant-initiated-transaction-options.interface';

/**
 * The Google Pay `AutomaticReloadTransactionInfo` fields a merchant supplies to enroll the user in a stored-value automatic reload.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-merchant-initiated-transaction-info.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#AutomaticReloadTransactionInfo
 */
export interface AndroidAutomaticReloadTransactionInfo extends AndroidMerchantInitiatedTransactionOptions {
    /** A short label of at most 100 characters, such as `Gift Card Reload`. */
    label: string;
    /** The stored-value balance that triggers a reload, `'0.00'` allowed. */
    minimumBalanceAmount: string;
    /** The non-zero amount charged on every reload. */
    reloadAmount: string;
}
