import { isDefined, isEmptyArray, isNotEmptyArray } from '@rnw-community/shared';

import { SupportedNetworkEnum } from '../enum/supported-networks.enum';

import { PLUGIN_DEFAULT_OPTIONS } from './plugin-default-options.constant';

const validSupportedNetworks: readonly string[] = Object.values(SupportedNetworkEnum);

const isSupportedNetwork = (network: string): network is SupportedNetworkEnum => validSupportedNetworks.includes(network);

export const validateSupportedNetworks = (supportedNetworks: readonly string[] | undefined): SupportedNetworkEnum[] => {
    if (!isDefined(supportedNetworks)) {
        return [...PLUGIN_DEFAULT_OPTIONS.supportedNetworks];
    }

    if (isEmptyArray(supportedNetworks)) {
        throw new Error('Please provide at least one "supportedNetworks" payments config value');
    }

    const invalidNetworks = supportedNetworks.filter(network => !isSupportedNetwork(network));

    if (isNotEmptyArray(invalidNetworks)) {
        const invalidNetworkList = invalidNetworks.map(network => `"${network}"`).join(', ');

        throw new Error(`Invalid "supportedNetworks" payments config value(s): ${invalidNetworkList}`);
    }

    return supportedNetworks.filter(isSupportedNetwork);
};
