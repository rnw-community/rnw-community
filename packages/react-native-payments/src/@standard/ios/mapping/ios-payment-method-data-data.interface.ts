import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface';
import type { IosPKMerchantCapability } from '../enum/ios-pk-merchant-capability.enum';

/**
 * The `data` dictionary of the Apple Pay `methodData` entry, carrying the merchant identifier, country and PassKit capabilities.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/ios-payment-method-data.md
 * @see https://developer.apple.com/documentation/passkit/pkpaymentrequest
 */
export interface IosPaymentMethodDataDataInterface extends GenericPaymentMethodDataDataInterface {
    applicationData?: string;
    countryCode: string;
    couponCode?: string;
    merchantCapabilities?: IosPKMerchantCapability[];
    merchantIdentifier: string;
}
