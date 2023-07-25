import { isNotEmptyString } from '@rnw-community/shared';

import { emptyAndroidPaymentMethodToken } from '../../@standard/android/response/android-payment-method-token';
import { emptyIosPaymentData } from '../../@standard/ios/response/ios-payment-data';

import { PaymentResponse } from './payment-response';

import type { IosCNPhoneNumber } from '../../@standard/ios/response/ios-cn-phone-number';
import type { IosCNPostalAddress } from '../../@standard/ios/response/ios-cn-postal-address';
import type { IosNSPersonNameComponents } from '../../@standard/ios/response/ios-ns-person-name-components';
import type { IosPaymentData } from '../../@standard/ios/response/ios-payment-data';
import type { IosPKPayment } from '../../@standard/ios/response/ios-pk-payment';
import type { IosPKToken } from '../../@standard/ios/response/ios-pk-token';
import type { IosRawPKToken } from '../../@standard/ios/response/ios-raw-pk-token';
import type { PaymentResponseAddressInterface } from '../../interface/payment-response-address.interface';

export class IosPaymentResponse extends PaymentResponse {
    constructor(requestId: string, methodName: string, jsonData: string) {
        const data = JSON.parse(jsonData) as IosPKPayment;

        super(requestId, methodName, {
            billingAddress: IosPaymentResponse.parsePKContact(data.billingContact?.postalAddress),
            applePayToken: IosPaymentResponse.parsePkToken(data.token),
            androidPayToken: emptyAndroidPaymentMethodToken,
            payerEmail: data.shippingContact?.emailAddress ?? '',
            payerName: IosPaymentResponse.parseNSPersonNameComponents(data.shippingContact?.name),
            payerPhone: IosPaymentResponse.parseCNPhoneNumber(data.shippingContact?.phoneNumber),
            shippingAddress: IosPaymentResponse.parsePKContact(data.shippingContact?.postalAddress),
        });
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
        return [input?.familyName, input?.middleName, input?.givenName].filter(isNotEmptyString).join('');
    }

    private static parseCNPhoneNumber(input?: IosCNPhoneNumber): string {
        return input?.stringValue ?? '';
    }
}
