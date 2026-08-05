import { EnvironmentEnum } from '../enum/environment.enum.js';
import { SupportedNetworkEnum } from '../enum/supported-networks.enum.js';

export const PLUGIN_DEFAULT_OPTIONS = {
    supportedNetworks: Object.values(SupportedNetworkEnum),
    googlePayEnvironment: EnvironmentEnum.PRODUCTION,
} as const;
