import type { RequestOptionsInterface } from '../interface/request-options.interface';

export const defaultRequestOptions: RequestOptionsInterface = {
    asyncUpdate: false,
    coupon: false,
    requestBillingAddress: false,
    requestPayerEmail: false,
    requestPayerName: false,
    requestPayerPhone: false,
    requestShipping: true,
    showDisplayItems: true,
    totalValue: '20.00',
};
