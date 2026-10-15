import { isDefined } from '@rnw-community/shared';

import { AndroidAllowedCardNetworksEnum } from '../../@standard/android/enum/android-allowed-card-networks.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

const androidCardNetworkMap: Partial<Record<SupportedNetworkEnum, AndroidAllowedCardNetworksEnum>> = {
    [SupportedNetworkEnum.Amex]: AndroidAllowedCardNetworksEnum.AMEX,
    [SupportedNetworkEnum.Discover]: AndroidAllowedCardNetworksEnum.DISCOVER,
    [SupportedNetworkEnum.Electron]: AndroidAllowedCardNetworksEnum.ELECTRON,
    [SupportedNetworkEnum.Elo]: AndroidAllowedCardNetworksEnum.ELO,
    [SupportedNetworkEnum.Interac]: AndroidAllowedCardNetworksEnum.INTERAC,
    [SupportedNetworkEnum.Jcb]: AndroidAllowedCardNetworksEnum.JCB,
    [SupportedNetworkEnum.Maestro]: AndroidAllowedCardNetworksEnum.MAESTRO,
    [SupportedNetworkEnum.Mastercard]: AndroidAllowedCardNetworksEnum.MASTERCARD,
    [SupportedNetworkEnum.Visa]: AndroidAllowedCardNetworksEnum.VISA,
};

export const getAndroidCardNetworks = (
    supportedNetworks: readonly SupportedNetworkEnum[]
): AndroidAllowedCardNetworksEnum[] => supportedNetworks.map(network => androidCardNetworkMap[network]).filter(isDefined);
