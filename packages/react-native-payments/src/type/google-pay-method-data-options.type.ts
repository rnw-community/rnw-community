import type { AndroidPaymentMethodDataDataInterface } from '../@standard/android/mapping/android-payment-method-data-data.interface';
import type { EnvironmentEnum } from '../enum/environment.enum';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

/**
 * The options of `createGooglePayMethodData`: the Google Pay method data with `environment` and `supportedNetworks` made optional.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/create-google-pay-method-data.md
 */
export type GooglePayMethodDataOptions = AndroidPaymentMethodDataDataInterface extends infer TData
    ? TData extends AndroidPaymentMethodDataDataInterface
        ? Omit<TData, 'environment' | 'supportedNetworks'> & {
              environment?: EnvironmentEnum;
              supportedNetworks?: SupportedNetworkEnum[];
          }
        : never
    : never;
