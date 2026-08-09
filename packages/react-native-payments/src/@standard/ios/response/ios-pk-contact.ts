import type { IosCNPhoneNumber } from './ios-cn-phone-number.js';
import type { IosCNPostalAddress } from './ios-cn-postal-address.js';
import type { IosNSPersonNameComponents } from './ios-ns-person-name-components.js';

/**
 * The Apple PassKit `PKContact` shape.
 *
 * @see https://developer.apple.com/documentation/passkit/pkcontact?language=objc
 */
export interface IosPKContact {
    emailAddress: string;
    name: IosNSPersonNameComponents;
    phoneNumber: IosCNPhoneNumber;
    postalAddress: IosCNPostalAddress;
}
