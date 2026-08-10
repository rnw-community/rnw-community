import type { EnvironmentEnum } from '../enum/environment.enum';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';

export interface ReactNativePaymentsPluginProps {
    merchantIdentifier: string | string[];
    supportedNetworks?: SupportedNetworkEnum[];
    googlePayEnvironment?: EnvironmentEnum;
}
