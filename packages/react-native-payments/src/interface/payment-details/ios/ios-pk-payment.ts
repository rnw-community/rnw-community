import type { IosPKContact } from './ios-pk-contact';
import type { IosPKShippingMethod } from './ios-pk-shipping-method';

// TODO: Check returned fields in the real app, to get full data
export interface IosPKPayment {
    /*
     * TODO: This data should additionally requested, should we add this possibility, how to handle on android?
     * HINT: has only postalAddress https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619221-billingcontact?language=objc
     */
    billingContact?: Pick<IosPKContact, 'postalAddress'>;
    // TODO: This data should additionally requested, should we add this possibility, how to handle on android?
    shippingContact?: IosPKContact;
    // TODO: This data should additionally requested, should we add this possibility, how to handle on android?
    shippingMethod?: IosPKShippingMethod;

    token: {
        /*
         * https://developer.apple.com/documentation/passkit/pkpaymenttoken/1617000-paymentdata?language=objc
         * Send this data to your e-commerce back-end system, where it can be decrypted and submitted to your payment processor.
         */
        paymentData: string;
        paymentMethod: {
            displayName: string;
            network: string;
            type: string;
        };
        transactionIdentifier: string;
    };
}
