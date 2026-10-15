export type AndroidMerchantInitiatedTransactionRequest<TTransactionInfo> = TTransactionInfo & {
    countryCode?: string;
    currencyCode: string;
    immediateTotalPrice: string;
    transactionId?: string;
};
