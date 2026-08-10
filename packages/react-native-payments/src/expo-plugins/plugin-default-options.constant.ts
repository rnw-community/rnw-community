import { EnvironmentEnum } from '../enum/environment.enum';
import { SupportedNetworkEnum } from '../enum/supported-networks.enum';

export const PLUGIN_DEFAULT_OPTIONS = {
    supportedNetworks: Object.values(SupportedNetworkEnum),
    googlePayEnvironment: EnvironmentEnum.PRODUCTION,
} as const;
