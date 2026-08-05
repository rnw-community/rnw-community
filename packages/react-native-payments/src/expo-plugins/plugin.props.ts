import type { EnvironmentEnum } from '../enum/environment.enum.js';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum.js';

export interface ReactNativePaymentsPluginProps {
    merchantIdentifier: string | string[];
    supportedNetworks?: SupportedNetworkEnum[];
    googlePayEnvironment?: EnvironmentEnum;
}
