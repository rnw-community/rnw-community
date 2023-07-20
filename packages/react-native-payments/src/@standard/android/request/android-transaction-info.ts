// https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo
export interface AndroidTransactionInfo {
    // This option is only available when totalPriceStatus is set to FINAL.
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
