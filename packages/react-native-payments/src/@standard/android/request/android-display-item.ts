/**
 * The Google Pay `DisplayItem` request shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#DisplayItem
 */
export interface AndroidDisplayItem {
    label: string;
    price: string;
    status: 'FINAL' | 'PENDING';
    type: 'DISCOUNT' | 'LINE_ITEM' | 'SHIPPING_OPTION' | 'SUBTOTAL' | 'TAX';
}
