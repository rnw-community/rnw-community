import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { AndroidPaymentMethodTokenizationType } from '../../@standard/android/enum/android-payment-method-tokenization-type.enum';
import { type AndroidCardInfo, emptyAndroidCardInfo } from '../../@standard/android/response/android-card-info';
import { emptyAndroidIntermediateSigningKey } from '../../@standard/android/response/android-intermediate-signing-key';
import { emptyAndroidPaymentMethodToken } from '../../@standard/android/response/android-payment-method-token';
import { emptyIosPKToken } from '../../@standard/ios/response/ios-pk-token';
import { PaymentsError } from '../../error/payments.error';

import { PaymentResponse } from './payment-response';

import type { AndroidFullAddress } from '../../@standard/android/response/android-full-address';
import type { AndroidMinAddress } from '../../@standard/android/response/android-min-address';
import type { AndroidPaymentData } from '../../@standard/android/response/android-payment-data';
import type { AndroidPaymentMethodToken } from '../../@standard/android/response/android-payment-method-token';
import type { AndroidPaymentMethodTokenizationData } from '../../@standard/android/response/android-payment-method-tokenization-data';
import type { AndroidRawPaymentMethodToken } from '../../@standard/android/response/android-raw-payment-method-token';
import type { AndroidSignedKey } from '../../@standard/android/response/android-signed-key';
import type { AndroidSignedMessage } from '../../@standard/android/response/android-signed-message';
import type { PaymentResponseAddressInterface } from '../../interface/payment-response-address.interface';
import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface';
import type { Maybe } from '@rnw-community/shared';

/**
 * The `PaymentResponse` that `show()` resolves with on Android, parsed from the Google Pay `PaymentData` payload.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/android-payment-response.md
 * @see https://developers.google.com/pay/api/android/reference/response-objects#PaymentData
 */
export class AndroidPaymentResponse extends PaymentResponse {
    constructor(requestId: string, methodName: string, jsonData: string, shippingOption: Maybe<string> = null) {
        super(requestId, methodName, AndroidPaymentResponse.parseDetails(jsonData), shippingOption);
    }

    private static parseDetails(jsonData: string): PaymentResponseDetailsInterface {
        try {
            const data = JSON.parse(jsonData) as AndroidPaymentData;

            return {
                billingAddress: AndroidPaymentResponse.parseFullAddress(data.paymentMethodData.info.billingAddress),
                androidPayToken: {
                    ...AndroidPaymentResponse.parseToken(data.paymentMethodData.tokenizationData),
                    cardInfo: AndroidPaymentResponse.parseCardInfo(data.paymentMethodData.info),
                },
                applePayToken: emptyIosPKToken,
                payerEmail: data.email,
                ...(isDefined(data.shippingAddress) && {
                    payerName: (data.shippingAddress as AndroidMinAddress).name,
                    payerPhone: (data.shippingAddress as AndroidMinAddress).phoneNumber ?? '',
                }),
                ...(isDefined(data.paymentMethodData.info.billingAddress) && {
                    payerName: (data.paymentMethodData.info.billingAddress as AndroidMinAddress).name,
                    payerPhone: (data.paymentMethodData.info.billingAddress as AndroidMinAddress).phoneNumber ?? '',
                }),
                shippingAddress: AndroidPaymentResponse.parseFullAddress(data.shippingAddress),
            };
        } catch (error) {
            throw error instanceof PaymentsError ? error : new PaymentsError(`Failed parsing PaymentRequest details`);
        }
    }

    private static parseToken({ token = '', type }: AndroidPaymentMethodTokenizationData): AndroidPaymentMethodToken {
        const parsedToken = AndroidPaymentResponse.parseGooglePaymentMethodToken(token);

        if (isDefined(parsedToken)) {
            return AndroidPaymentResponse.toPaymentMethodToken(token, parsedToken);
        }

        if (type === AndroidPaymentMethodTokenizationType.PAYMENT_GATEWAY && isNotEmptyString(token)) {
            return { ...emptyAndroidPaymentMethodToken, rawToken: token };
        }

        throw new PaymentsError(`Invalid Google Pay ${type} payment method token`);
    }

    private static toPaymentMethodToken(
        rawToken: string,
        parsedToken: AndroidRawPaymentMethodToken
    ): AndroidPaymentMethodToken {
        return {
            ...emptyAndroidPaymentMethodToken,
            ...parsedToken,
            rawToken,
            intermediateSigningKey: {
                ...(isDefined(parsedToken.intermediateSigningKey)
                    ? {
                          ...parsedToken.intermediateSigningKey,
                          signedKey: JSON.parse(parsedToken.intermediateSigningKey.signedKey) as AndroidSignedKey,
                      }
                    : emptyAndroidIntermediateSigningKey),
            },
            signedMessage: JSON.parse(parsedToken.signedMessage) as AndroidSignedMessage,
        };
    }

    private static parseGooglePaymentMethodToken(token: string): Maybe<AndroidRawPaymentMethodToken> {
        try {
            const parsedToken = JSON.parse(token) as Maybe<Partial<AndroidRawPaymentMethodToken>>;

            return [parsedToken?.protocolVersion, parsedToken?.signature, parsedToken?.signedMessage].every(isNotEmptyString)
                ? (parsedToken as AndroidRawPaymentMethodToken)
                : null;
        } catch {
            return null;
        }
    }

    private static parseFullAddress(input?: AndroidFullAddress): PaymentResponseAddressInterface {
        return {
            countryCode: input?.countryCode ?? '',
            postalCode: input?.postalCode ?? '',
            address1: input?.address1 ?? '',
            address2: input?.address2 ?? '',
            address3: input?.address3 ?? '',
            administrativeArea: input?.administrativeArea ?? '',
            locality: input?.locality ?? '',
            sortingCode: input?.sortingCode ?? '',
        };
    }

    private static parseCardInfo(androidCardInfo: AndroidCardInfo): AndroidCardInfo {
        return {
            ...emptyAndroidCardInfo,
            cardNetwork: androidCardInfo.cardNetwork,
            cardDetails: androidCardInfo.cardDetails,
            assuranceDetails: androidCardInfo.assuranceDetails,
        };
    }
}
