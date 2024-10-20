import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, Text } from 'react-native';

import {
    type AndroidPaymentMethodDataInterface,
    type IosPaymentMethodDataInterface,
    PaymentComplete,
    type PaymentDetailsInit,
    PaymentRequest,
} from '@rnw-community/react-native-payments';
import { getErrorMessage, isDefined } from '@rnw-community/shared';

import {
    androidPaymentMethodDataWithoutShipping,
    androidPaymentMethodData as defaultAndroidPaymentMethodData,
} from '../method-data/android-payment-method-data';
import {
    iosPaymentMethodData as defaultIosPaymentMethodData,
    iosPaymentMethodDataWithoutShipping,
} from '../method-data/ios-payment-method-data';
import { paymentDetails as defaultPaymentDetails, paymentDetailsWithoutDisplayItems } from '../payment-details';

/*
 * TODO: Add UI to add items
 * ts-prune-ignore-next
 */
export const App = (): JSX.Element => {
    const [error, setError] = useState('');
    const [response, setResponse] = useState<object>();
    const [isWalletAvailable, setIsWalletAvailable] = useState(false);

    interface CreatePaymentRequestProps {
        androidPaymentMethodData?: AndroidPaymentMethodDataInterface;
        iosPaymentMethodData?: IosPaymentMethodDataInterface;
        paymentDetails?: PaymentDetailsInit;
    }

    const createPaymentRequest = ({
        androidPaymentMethodData,
        iosPaymentMethodData,
        paymentDetails,
    }: CreatePaymentRequestProps = {}): PaymentRequest => {
        setError('');
        setResponse(undefined);

        return new PaymentRequest(
            [
                iosPaymentMethodData ?? defaultIosPaymentMethodData,
                androidPaymentMethodData ?? defaultAndroidPaymentMethodData,
            ],
            paymentDetails ?? defaultPaymentDetails
        );
    };

    const handlePay = (): void => {
        createPaymentRequest()
            .show()
            .then(paymentResponse => {
                setResponse(paymentResponse.details);

                return paymentResponse.complete(PaymentComplete.SUCCESS);
            })
            .catch((err: unknown) => void setError(getErrorMessage(err)));
    };

    const handlePayWithoutDisplayItems = (): void => {
        createPaymentRequest({ paymentDetails: paymentDetailsWithoutDisplayItems })
            .show()
            .then(paymentResponse => {
                setResponse(paymentResponse.details);

                return paymentResponse.complete(PaymentComplete.SUCCESS);
            })
            .catch((err: unknown) => void setError(getErrorMessage(err)));
    };

    const handlePayWithAbort = (): void => {
        const paymentRequest = createPaymentRequest();

        paymentRequest.show().catch((err: unknown) => {
            setError(getErrorMessage(err));
        });

        setTimeout(() => void paymentRequest.abort(), 1000);
    };

    const handlePayWithoutShipping = (): void => {
        createPaymentRequest({
            iosPaymentMethodData: iosPaymentMethodDataWithoutShipping,
            androidPaymentMethodData: androidPaymentMethodDataWithoutShipping,
        })
            .show()
            .then(paymentResponse => {
                setResponse(paymentResponse.details);

                return paymentResponse.complete(PaymentComplete.SUCCESS);
            })
            .catch((err: unknown) => void setError(getErrorMessage(err)));
    };

    useEffect(() => {
        createPaymentRequest()
            .canMakePayment()
            .then(result => void setIsWalletAvailable(result))
            .catch(() => void setIsWalletAvailable(false));
    }, []);

    const responseTextStyle = { color: 'red' };

    return (
        <SafeAreaView>
            {isWalletAvailable ? (
                <>
                    <Button onPress={handlePay} title="AndroidPay/ApplePay" />
                    <Button onPress={handlePayWithoutDisplayItems} title="ApplePay without displayItems" />
                    <Button onPress={handlePayWithAbort} title="ApplePay with delayed abort" />
                    <Button onPress={handlePayWithoutShipping} title="AndroidPay/ApplePay without shipping" />
                    <Text>{error}</Text>
                    {isDefined(response) && <Text style={responseTextStyle}>Response:{JSON.stringify(response)}</Text>}
                </>
            ) : (
                <Text>Unfortunately Apple/Google pay is not available</Text>
            )}
        </SafeAreaView>
    );
};
