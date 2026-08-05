import {
    type AndroidAssuranceDetailsSpecifications,
    emptyAndroidAssuranceDetailsSpecifications,
} from './android-assurance-details-specifications.js';

import type { AndroidFullAddress } from './android-full-address.js';

// https://developers.google.com/pay/api/android/reference/response-objects#CardInfo
export interface AndroidCardInfo {
    assuranceDetails: AndroidAssuranceDetailsSpecifications;
    // HINT: This field will be returned if request in the payment request
    billingAddress?: AndroidFullAddress;
    cardDetails: string;
    cardNetwork: string;
}

export const emptyAndroidCardInfo: AndroidCardInfo = {
    assuranceDetails: emptyAndroidAssuranceDetailsSpecifications,
    cardDetails: '',
    cardNetwork: '',
};
