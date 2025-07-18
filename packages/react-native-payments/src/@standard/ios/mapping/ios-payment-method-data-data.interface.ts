import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface';
import type { IosPKMerchantCapability } from '../enum/ios-pk-merchant-capability.enum';

export interface IosPaymentMethodDataDataInterface extends GenericPaymentMethodDataDataInterface {
    applicationData?: string;
    countryCode: string;
    merchantCapabilities?: IosPKMerchantCapability[];
    merchantIdentifier: string;
}
