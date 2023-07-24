import type { IosPKMerchantCapability } from '../enum/ios-pk-merchant-capability.enum';
import type { IosPKPaymentNetworksEnum } from '../enum/ios-pk-payment-networks.enum';

// https://developer.apple.com/documentation/passkit/pkpaymentrequest?language=objc
export interface IosPaymentDataRequest {
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619246-countrycode?language=objc
    countryCode: string;
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619248-currencycode?language=objc
    currencyCode: string;
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619257-merchantcapabilities?language=objc
    merchantCapabilities: IosPKMerchantCapability[];
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619305-merchantidentifier?language=objc
    merchantIdentifier: string;
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865928-requiredbillingcontactfields?language=objc
    requiredBillingContactFields?: boolean;
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/2865927-requiredshippingcontactfields?language=objc
    requiredShippingContactFields?: boolean;
    // https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619329-supportednetworks?language=objc
    supportedNetworks: IosPKPaymentNetworksEnum[];
}
