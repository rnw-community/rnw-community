import { PaymentRequest } from '@rnw-community/react-native-payments';

import { getPaymentDetails } from './get-payment-details.js';
import { getAndroidPaymentMethodData } from './method-data/android-payment-method-data.js';
import { getIosPaymentMethodData } from './method-data/ios-payment-method-data.js';

import type { RequestOptionsInterface } from '../interface/request-options.interface.js';

export const createPaymentRequest = (options: RequestOptionsInterface): PaymentRequest =>
    new PaymentRequest([getIosPaymentMethodData(options), getAndroidPaymentMethodData(options)], getPaymentDetails(options));
