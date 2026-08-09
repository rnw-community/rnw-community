/**
 * The Google Pay `TransactionInfo` request shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo
 */
export interface AndroidTransactionInfo {
    checkoutOption?: 'COMPLETE_IMMEDIATE_PURCHASE' | 'DEFAULT';
    countryCode?: string;
    currencyCode: string;
    totalPrice: string;
    totalPriceLabel?: string;
    totalPriceStatus: 'ESTIMATED' | 'FINAL' | 'NOT_CURRENTLY_KNOWN';
    transactionId?: string;
}

export const defaultAndroidTransactionInfo: AndroidTransactionInfo = {
    currencyCode: '',
    totalPriceStatus: 'FINAL',
    totalPrice: '',
};
