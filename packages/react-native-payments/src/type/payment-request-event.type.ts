/**
 * The W3C payment request change-event names, including the PassKit `couponcodechange` extension.
 *
 * @see https://www.w3.org/TR/payment-request/#dom-paymentrequest-onshippingaddresschange
 * @see https://www.w3.org/TR/payment-request/#dom-paymentrequest-onshippingoptionchange
 * @see https://www.w3.org/TR/payment-request/#dom-paymentrequest-onpaymentmethodchange
 * @see https://developer.apple.com/documentation/passkit/pkpaymentrequest/3801275-couponcode?language=objc
 */
export type PaymentRequestEventType =
    | 'couponcodechange'
    | 'paymentmethodchange'
    | 'shippingaddresschange'
    | 'shippingoptionchange';
