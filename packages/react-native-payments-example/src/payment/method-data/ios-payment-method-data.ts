import { type IosPaymentMethodDataInterface, createApplePayMethodData } from '@rnw-community/react-native-payments';

import type { RequestOptionsInterface } from '../../interface/request-options.interface';

export const getIosPaymentMethodData = ({
    requestBillingAddress,
    requestPayerEmail,
    requestPayerName,
    requestPayerPhone,
    requestShipping,
}: RequestOptionsInterface): IosPaymentMethodDataInterface =>
    createApplePayMethodData({
        requestBillingAddress,
        requestPayerName,
        requestPayerEmail,
        requestPayerPhone,
        requestShipping,
        countryCode: 'US',
        currencyCode: 'USD',
        merchantIdentifier: 'merchant.react-native-payments',
    });
