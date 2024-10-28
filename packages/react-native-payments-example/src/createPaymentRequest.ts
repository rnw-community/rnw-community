import {
    type AndroidPaymentMethodDataInterface,
    type IosPaymentMethodDataInterface,
    type PaymentDetailsInit,
    PaymentRequest,
} from '@rnw-community/react-native-payments';

import { androidPaymentMethodData as defaultAndroidPaymentMethodData } from './method-data/android-payment-method-data';
import { iosPaymentMethodData as defaultIosPaymentMethodData } from './method-data/ios-payment-method-data';
import { paymentDetails as defaultPaymentDetails } from './payment-details';

interface CreatePaymentRequestProps {
    androidPaymentMethodData?: AndroidPaymentMethodDataInterface;
    iosPaymentMethodData?: IosPaymentMethodDataInterface;
    paymentDetails?: PaymentDetailsInit;
}

export const createPaymentRequest = ({
    androidPaymentMethodData,
    iosPaymentMethodData,
    paymentDetails,
}: CreatePaymentRequestProps = {}): PaymentRequest =>
    new PaymentRequest(
        [iosPaymentMethodData ?? defaultIosPaymentMethodData, androidPaymentMethodData ?? defaultAndroidPaymentMethodData],
        paymentDetails ?? defaultPaymentDetails
    );
