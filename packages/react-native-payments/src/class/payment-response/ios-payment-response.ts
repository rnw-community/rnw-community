import { isNotEmptyString } from '@rnw-community/shared';

import { emptyAndroidPaymentMethodToken } from '../../@standard/android/response/android-payment-method-token.js';
import { emptyIosPaymentData } from '../../@standard/ios/response/ios-payment-data.js';
import { PaymentsError } from '../../error/payments.error.js';

import { PaymentResponse } from './payment-response.js';

import type { IosCNPhoneNumber } from '../../@standard/ios/response/ios-cn-phone-number.js';
import type { IosCNPostalAddress } from '../../@standard/ios/response/ios-cn-postal-address.js';
import type { IosNSPersonNameComponents } from '../../@standard/ios/response/ios-ns-person-name-components.js';
import type { IosPaymentData } from '../../@standard/ios/response/ios-payment-data.js';
import type { IosPKPayment } from '../../@standard/ios/response/ios-pk-payment.js';
import type { IosPKToken } from '../../@standard/ios/response/ios-pk-token.js';
import type { IosRawPKToken } from '../../@standard/ios/response/ios-raw-pk-token.js';
import type { PaymentResponseAddressInterface } from '../../interface/payment-response-address.interface.js';
import type { PaymentResponseDetailsInterface } from '../../interface/payment-response-details.interface.js';
import type { Maybe } from '@rnw-community/shared';

export class IosPaymentResponse extends PaymentResponse {
    constructor(requestId: string, methodName: string, jsonData: string, shippingOption: Maybe<string> = null) {
        super(requestId, methodName, IosPaymentResponse.parseDetails(jsonData), shippingOption);
    }

    private static parseDetails(jsonData: string): PaymentResponseDetailsInterface {
        try {
            const data = JSON.parse(jsonData) as IosPKPayment;

            return {
                billingAddress: IosPaymentResponse.parsePKContact(data.billingContact?.postalAddress),
                applePayToken: IosPaymentResponse.parsePkToken(data.token),
                androidPayToken: emptyAndroidPaymentMethodToken,
                payerEmail: data.shippingContact?.emailAddress ?? '',
                payerName: IosPaymentResponse.parseNSPersonNameComponents(data.shippingContact?.name),
                payerPhone: IosPaymentResponse.parseCNPhoneNumber(data.shippingContact?.phoneNumber),
                shippingAddress: IosPaymentResponse.parsePKContact(data.shippingContact?.postalAddress),
            };
        } catch {
            throw new PaymentsError(`Failed parsing PaymentRequest details`);
        }
    }

    private static parsePkToken(input: IosRawPKToken): IosPKToken {
        return {
            ...input,
            paymentData: isNotEmptyString(input.paymentData)
                ? (JSON.parse(input.paymentData) as IosPaymentData)
                : emptyIosPaymentData,
        };
    }

    private static parsePKContact(input?: IosCNPostalAddress): PaymentResponseAddressInterface {
        return {
            countryCode: input?.ISOCountryCode ?? '',
            postalCode: input?.postalCode ?? '',
            address1: input?.street ?? '',
            address2: input?.city ?? '',
            address3: input?.state ?? '',
            administrativeArea: input?.subAdministrativeArea ?? '',
            locality: input?.subLocality ?? '',
            sortingCode: '',
        };
    }

    private static parseNSPersonNameComponents(input?: IosNSPersonNameComponents): string {
        return [input?.familyName, input?.middleName, input?.givenName].filter(isNotEmptyString).join(',');
    }

    private static parseCNPhoneNumber(input?: IosCNPhoneNumber): string {
        return input?.stringValue ?? '';
    }
}
