// https://developers.google.com/pay/api/android/reference/response-objects#assurance-details-specifications
export interface AndroidAssuranceDetailsSpecifications {
    accountVerified: boolean;
    cardHolderAuthenticated: boolean;
}

export const emptyAndroidAssuranceDetailsSpecifications = {
    accountVerified: false,
    cardHolderAuthenticated: false,
};
