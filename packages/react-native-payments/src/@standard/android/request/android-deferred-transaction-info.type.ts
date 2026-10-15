import type { AndroidDisplayItem } from './android-display-item.interface';
import type { AndroidMerchantInitiatedPrice } from './android-merchant-initiated-price.type';
import type { AndroidMerchantInitiatedTransactionOptions } from './android-merchant-initiated-transaction-options.interface';

/**
 * The Google Pay `DeferredTransactionInfo` fields a merchant supplies for a single future charge such as a pre-order or a booking.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-merchant-initiated-transaction-info.md
 * @see https://developers.google.com/pay/api/android/reference/request-objects#DeferredTransactionInfo
 */
export type AndroidDeferredTransactionInfo = AndroidMerchantInitiatedPrice &
    AndroidMerchantInitiatedTransactionOptions & {
        billingDateTime: string;
        displayItems?: AndroidDisplayItem[];
        label: string;
    };
