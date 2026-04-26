// https://developer.apple.com/documentation/contacts/cnpostaladdress?language=objc
// Optional name fields: merged from PKContact.name in native JSON (not part of CNPostalAddress on device).
export interface IosCNPostalAddress {
    ISOCountryCode: string;
    city: string;
    country: string;
    postalCode: string;
    state: string;
    street: string;
    subAdministrativeArea: string;
    subLocality: string;
    givenName?: string;
    familyName?: string;
    middleName?: string;
}
