import type { IosPKContact } from './ios-pk-contact.js';
import type { IosPKShippingMethod } from './ios-pk-shipping-method.js';
import type { IosRawPKToken } from './ios-raw-pk-token.js';

/**
 * The Apple PassKit `PKPayment` shape.
 *
 * @see https://developer.apple.com/documentation/passkit/pkpayment
 */
export interface IosPKPayment {
    billingContact?: Pick<IosPKContact, 'name' | 'postalAddress'>;
    shippingContact?: IosPKContact;
    shippingMethod?: IosPKShippingMethod;
    token: IosRawPKToken;
}
