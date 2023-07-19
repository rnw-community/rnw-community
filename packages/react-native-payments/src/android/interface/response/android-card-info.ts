import type { AndroidAddress } from './android-address';
import type { AndroidAssuranceDetailsSpecifications } from './android-assurance-details-specifications';

// https://developers.google.com/pay/api/android/reference/response-objects#CardInfo
export interface AndroidCardInfo {
    assuranceDetails: AndroidAssuranceDetailsSpecifications;
    billingAddress?: AndroidAddress;
    cardDetails: string;
    cardNetwork: string;
}
