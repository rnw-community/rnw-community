// https://www.w3.org/TR/payment-request/#dom-paymentrequest-onshippingaddresschange
// https://www.w3.org/TR/payment-request/#dom-paymentrequest-onshippingoptionchange
// https://www.w3.org/TR/payment-request/#dom-paymentrequest-onpaymentmethodchange
// couponcodechange is a PassKit extension: https://developer.apple.com/documentation/passkit/pkpaymentrequest/3801275-couponcode?language=objc
export type PaymentRequestEventType =
    | 'couponcodechange'
    | 'paymentmethodchange'
    | 'shippingaddresschange'
    | 'shippingoptionchange';
