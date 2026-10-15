import type { IosPaymentMethodDataDataInterface } from '../@standard/ios/mapping/ios-payment-method-data-data.interface';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

/**
 * The options of `createApplePayMethodData`: the Apple Pay method data with `supportedNetworks` made optional.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/create-apple-pay-method-data.md
 */
export interface ApplePayMethodDataOptions extends Omit<IosPaymentMethodDataDataInterface, 'supportedNetworks'> {
    /**
     * The card networks offered in the Apple Pay sheet.
     *
     * @defaultValue `[SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard]`
     */
    supportedNetworks?: SupportedNetworkEnum[];
}
