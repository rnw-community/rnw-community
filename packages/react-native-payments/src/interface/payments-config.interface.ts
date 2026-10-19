import type { EnvironmentEnum } from '../enum/environment.enum';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

/**
 * The one payments config shared by the Expo plugin, `rnw-payments doctor` and `resolvePaymentsConfig` at runtime.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payments-config.md
 */
export interface PaymentsConfig {
    /** The Apple Pay merchant identifier(s) declared in the `com.apple.developer.in-app-payments` entitlement. */
    merchantIdentifier: string | string[];
    /**
     * The card networks written to the Android manifest and offered by the method data.
     *
     * @defaultValue every `SupportedNetworkEnum` value
     */
    supportedNetworks?: Array<SupportedNetworkEnum | `${SupportedNetworkEnum}`>;
    /**
     * The Google Pay environment written to the Android manifest and used by the method data.
     *
     * @defaultValue `EnvironmentEnum.PRODUCTION`
     */
    googlePayEnvironment?: EnvironmentEnum | `${EnvironmentEnum}`;
}
