import {
    type AndroidPaymentMethodDataInterface,
    type IosPaymentMethodDataInterface,
    type PaymentDetailsInit,
    PaymentRequest,
} from '@rnw-community/react-native-payments';

import { getAndroidPaymentMethodData } from './method-data/android-payment-method-data';
import { getIosPaymentMethodData } from './method-data/ios-payment-method-data';
import { paymentDetails as defaultPaymentDetails } from './payment-details';

interface CreatePaymentRequestProps {
    androidPaymentMethodData?: AndroidPaymentMethodDataInterface;
    iosPaymentMethodData?: IosPaymentMethodDataInterface;
    paymentDetails?: PaymentDetailsInit;
}

export const createPaymentRequest = ({
    androidPaymentMethodData = getAndroidPaymentMethodData(),
    iosPaymentMethodData = getIosPaymentMethodData(),
    paymentDetails = defaultPaymentDetails,
}: CreatePaymentRequestProps = {}): PaymentRequest =>
    new PaymentRequest([iosPaymentMethodData, androidPaymentMethodData], paymentDetails);
