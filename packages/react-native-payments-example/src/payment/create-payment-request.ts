import { PaymentRequest } from '@rnw-community/react-native-payments';

import { getPaymentDetails } from './get-payment-details';
import { getAndroidPaymentMethodData } from './method-data/android-payment-method-data';
import { getIosPaymentMethodData } from './method-data/ios-payment-method-data';

import type { RequestOptionsInterface } from '../interface/request-options.interface';

export const createPaymentRequest = (options: RequestOptionsInterface): PaymentRequest =>
    new PaymentRequest([getIosPaymentMethodData(options), getAndroidPaymentMethodData(options)], getPaymentDetails(options));
