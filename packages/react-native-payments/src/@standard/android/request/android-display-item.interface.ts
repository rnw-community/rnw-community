/**
 * The Google Pay `DisplayItem` request shape used for the line items of a transaction, merchant-initiated or regular.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-merchant-initiated-transaction-info.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#DisplayItem
 */
export interface AndroidDisplayItem {
    /** The label shown for the line item in the Google Pay sheet. */
    label: string;
    /** The monetary value with up to two decimal places, negative values allowed. */
    price: string;
    /**
     * Whether the price is final or still pending.
     *
     * @defaultValue `'FINAL'`
     */
    status?: 'FINAL' | 'PENDING';
    /** The kind of line item. */
    type: 'DISCOUNT' | 'LINE_ITEM' | 'SHIPPING_OPTION' | 'SUBTOTAL' | 'TAX';
}
