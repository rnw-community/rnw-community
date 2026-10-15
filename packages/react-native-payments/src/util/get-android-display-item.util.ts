import type { AndroidDisplayItem } from '../@standard/android/request/android-display-item';
import type { PaymentItem } from '../@standard/w3c/payment-item';

export const getAndroidDisplayItem = (item: PaymentItem): AndroidDisplayItem => ({
    label: item.label,
    price: item.amount.value,
    status: item.pending === true ? 'PENDING' : 'FINAL',
    type: 'LINE_ITEM',
});
