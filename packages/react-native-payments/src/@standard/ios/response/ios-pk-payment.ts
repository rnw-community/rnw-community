import type { IosPKContact } from './ios-pk-contact';
import type { IosPKShippingMethod } from './ios-pk-shipping-method';
import type { IosRawPKToken } from './ios-raw-pk-token';

// https://developer.apple.com/documentation/passkit/pkpayment
export interface IosPKPayment {
    // HINT: has only postalAddress https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619221-billingcontact?language=objc
    billingContact?: Pick<IosPKContact, 'postalAddress'>;
    shippingContact?: IosPKContact;
    shippingMethod?: IosPKShippingMethod;
    token: IosRawPKToken;
}
