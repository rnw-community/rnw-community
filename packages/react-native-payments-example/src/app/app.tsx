import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, Text } from 'react-native';

import { getErrorMessage, isDefined } from '@rnw-community/shared';

import { createPaymentRequest } from '../create-payment-request';
import { RequestOptionsForm } from '../request-options-form';

import type { PaymentResponse } from '@rnw-community/react-native-payments';

/*
 * TODO: Add UI to add items
 * ts-prune-ignore-next
 */
export const App = (): JSX.Element => {
    const [error, setError] = useState('');
    const [response, setResponse] = useState<PaymentResponse['details']>();
    const [isWalletAvailable, setIsWalletAvailable] = useState(false);

    const clearErrorAndResponse = (): void => {
        setError('');
        setResponse(undefined);
    };

    const handlePayWithAbort = (): void => {
        clearErrorAndResponse();
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

    return (
        <SafeAreaView>
            <ScrollView>
                {isWalletAvailable ? (
                    <>
                        <Button onPress={handlePayWithAbort} title="ApplePay with delayed abort" />
                        <RequestOptionsForm setError={setError} setResponse={setResponse} />
                        {Boolean(error) && <Text style={errorTextStyle}>Error: {error}</Text>}
                        {isDefined(response) && (
                            <Text style={responseTextStyle}>Response: {JSON.stringify(response, null, 2)}</Text>
                        )}
                    </>
                ) : (
                    <Text>Unfortunately Apple/Google pay is not available</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const responseTextStyle = { color: 'green' };
const errorTextStyle = { color: 'red' };
