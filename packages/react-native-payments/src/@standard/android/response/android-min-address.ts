// https://developers.google.com/pay/api/android/reference/response-objects#Address
export interface AndroidMinAddress {
    countryCode: string;
    name: string;
    phoneNumber?: string;
    postalCode: string;
}
