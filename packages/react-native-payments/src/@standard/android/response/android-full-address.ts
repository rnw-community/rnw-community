import type { AndroidMinAddress } from './android-min-address';

/**
 * The Google Pay `Address` response shape (full fields).
 *
 * @see https://developers.google.com/pay/api/android/reference/response-objects#Address
 */
export interface AndroidFullAddress extends AndroidMinAddress {
    address1?: string;
    address2?: string;
    address3?: string;
    administrativeArea?: string;
    locality?: string;
    sortingCode?: string;
}
