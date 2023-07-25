import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, Text } from 'react-native';

import { PaymentComplete, PaymentRequest } from '@rnw-community/react-native-payments';
import { getErrorMessage, isDefined } from '@rnw-community/shared';

import { androidPaymentMethodData } from '../method-data/android-payment-method-data';
import { iosPaymentMethodData } from '../method-data/ios-payment-method-data';
import { paymentDetails } from '../payment-details';

/*
 * TODO: Add UI to add items
 * ts-prune-ignore-next
 */
export const App = (): JSX.Element => {
    const [error, setError] = useState('');
    const [response, setResponse] = useState<object>();
    const [isWalletAvailable, setIsWalletAvailable] = useState(false);

    const createPaymentRequest = (): PaymentRequest => {
        setError('');
        setResponse(undefined);

        return new PaymentRequest([iosPaymentMethodData, androidPaymentMethodData], paymentDetails);
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
    const handlePayWithAbort = (): void => {
        const paymentRequest = createPaymentRequest();

        paymentRequest.show().catch((err: unknown) => {
            setError(getErrorMessage(err));
        });

        setTimeout(() => void paymentRequest.abort(), 1000);
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
                    <Button onPress={handlePayWithAbort} title="ApplePay with delayed abort" />
                    <Text>{error}</Text>
                    {isDefined(response) && <Text style={responseTextStyle}>Response:{JSON.stringify(response)}</Text>}
                </>
            ) : (
                <Text>Unfortunately Apple/Google pay is not available</Text>
            )}
        </SafeAreaView>
    );
};
