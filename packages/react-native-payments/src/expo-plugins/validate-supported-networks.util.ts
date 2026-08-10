import { isDefined, isEmptyArray, isNotEmptyArray } from '@rnw-community/shared';

import { SupportedNetworkEnum } from '../enum/supported-networks.enum';

import { PLUGIN_DEFAULT_OPTIONS } from './plugin-default-options.constant';

const validSupportedNetworks: readonly string[] = Object.values(SupportedNetworkEnum);

export const validateSupportedNetworks = (
    supportedNetworks: SupportedNetworkEnum[] | undefined
): SupportedNetworkEnum[] => {
    if (!isDefined(supportedNetworks)) {
        return PLUGIN_DEFAULT_OPTIONS.supportedNetworks;
    }

    if (isEmptyArray(supportedNetworks)) {
        throw new Error('Please provide at least one "supportedNetworks" plugin option value');
    }

    const invalidNetworks = supportedNetworks.filter(network => !validSupportedNetworks.includes(network));

    if (isNotEmptyArray(invalidNetworks)) {
        const invalidNetworkList = invalidNetworks.map(network => `"${network}"`).join(', ');

        throw new Error(`Invalid "supportedNetworks" plugin option value(s): ${invalidNetworkList}`);
    }

    return supportedNetworks;
};
