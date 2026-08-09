import type { PaymentShippingTypeEnum } from '../../../enum/payment-shipping-type.enum.js';
import type { IOSPKContactField } from '../enum/ios-pk-contact-field.enum.js';
import type { IosPKMerchantCapability } from '../enum/ios-pk-merchant-capability.enum.js';
import type { IosPKPaymentNetworksEnum } from '../enum/ios-pk-payment-networks.enum.js';

/**
 * The Apple PassKit `PKPaymentRequest` shape.
 *
 * @see https://developer.apple.com/documentation/passkit/pkpaymentrequest?language=objc
 */
export interface IosPaymentDataRequest {
    applicationData?: string;
    countryCode: string;
    couponCode?: string;
    currencyCode: string;
    merchantCapabilities: IosPKMerchantCapability[];
    merchantIdentifier: string;
    requiredBillingContactFields?: IOSPKContactField[];
    requiredShippingContactFields?: IOSPKContactField[];
    shippingType?: PaymentShippingTypeEnum;
    supportedNetworks: IosPKPaymentNetworksEnum[];
}
