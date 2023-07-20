// TODO: Validate/map with data returned from the platforms
export interface PaymentAddress {
    addressLine: string | null;
    city: string;
    country: string;
    dependentLocality: string | null;
    languageCode: string | null;
    organization: string | null;
    phone: string | null;
    postalCode: string;
    recipient: string | null;
    region: string;
    sortingCode: string | null;
}
