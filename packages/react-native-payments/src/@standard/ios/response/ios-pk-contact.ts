import type { IosCNPhoneNumber } from './ios-cn-phone-number';
import type { IosCNPostalAddress } from './ios-cn-postal-address';
import type { IosNSPersonNameComponents } from './ios-ns-person-name-components';

// https://developer.apple.com/documentation/passkit/pkcontact?language=objc
export interface IosPKContact {
    emailAddress: string;
    name: IosNSPersonNameComponents;
    phoneNumber: IosCNPhoneNumber;
    postalAddress: IosCNPostalAddress;
}
