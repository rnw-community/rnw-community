import type { AndroidAssuranceDetailsSpecifications } from './android-assurance-details-specifications';
import type { AndroidFullAddress } from './android-full-address';

// https://developers.google.com/pay/api/android/reference/response-objects#CardInfo
export interface AndroidCardInfo {
    assuranceDetails: AndroidAssuranceDetailsSpecifications;
    // HINT: This field will be returned if request in the payment request
    billingAddress?: AndroidFullAddress;
    cardDetails: string;
    cardNetwork: string;
}
