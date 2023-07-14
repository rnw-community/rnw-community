import { PaymentShippingType } from '../enum/payment-shipping.enum';

/*
 * TODO: Link is not working - we need to find it and define if we need it?
 * https://www.w3.org/TR/payment-request/#paymentoptions-dictionary
 */
export interface PaymentOptions {
    requestBilling: boolean;
    requestPayerEmail: boolean;
    requestPayerName: boolean;
    requestPayerPhone: boolean;
    requestShipping: boolean;
    shippingType: PaymentShippingType;
}
export const emptyPaymentOptions: PaymentOptions = {
    requestBilling: false,
    requestPayerEmail: false,
    requestPayerName: false,
    requestPayerPhone: false,
    requestShipping: false,
    shippingType: PaymentShippingType.SHIPPING,
};
