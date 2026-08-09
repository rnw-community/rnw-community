import {
    type AndroidAssuranceDetailsSpecifications,
    emptyAndroidAssuranceDetailsSpecifications,
} from './android-assurance-details-specifications.js';

import type { AndroidFullAddress } from './android-full-address.js';

/**
 * The Google Pay `CardInfo` response shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/response-objects#CardInfo
 */
export interface AndroidCardInfo {
    assuranceDetails: AndroidAssuranceDetailsSpecifications;
    billingAddress?: AndroidFullAddress;
    cardDetails: string;
    cardNetwork: string;
}

export const emptyAndroidCardInfo: AndroidCardInfo = {
    assuranceDetails: emptyAndroidAssuranceDetailsSpecifications,
    cardDetails: '',
    cardNetwork: '',
};
