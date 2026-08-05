import type { IosPKContact } from './ios-pk-contact.js';
import type { IosPKShippingMethod } from './ios-pk-shipping-method.js';
import type { IosRawPKToken } from './ios-raw-pk-token.js';

// https://developer.apple.com/documentation/passkit/pkpayment
export interface IosPKPayment {
    // HINT: PassKit only fills the postal address and the name https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619221-billingcontact?language=objc
    billingContact?: Pick<IosPKContact, 'name' | 'postalAddress'>;
    shippingContact?: IosPKContact;
    shippingMethod?: IosPKShippingMethod;
    token: IosRawPKToken;
}
