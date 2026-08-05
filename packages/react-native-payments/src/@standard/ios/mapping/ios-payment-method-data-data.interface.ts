import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface.js';
import type { IosPKMerchantCapability } from '../enum/ios-pk-merchant-capability.enum.js';

export interface IosPaymentMethodDataDataInterface extends GenericPaymentMethodDataDataInterface {
    applicationData?: string;
    countryCode: string;
    couponCode?: string;
    merchantCapabilities?: IosPKMerchantCapability[];
    merchantIdentifier: string;
}
