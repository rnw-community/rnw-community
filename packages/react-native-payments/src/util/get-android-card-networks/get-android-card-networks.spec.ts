import { describe, expect, it } from '@jest/globals';

import { AndroidAllowedCardNetworksEnum } from '../../@standard/android/enum/android-allowed-card-networks.enum';
import { SupportedNetworkEnum } from '../../enum/supported-networks.enum';

import { getAndroidCardNetworks } from './get-android-card-networks.util';

describe('getAndroidCardNetworks', () => {
    it('maps every network Google Pay accepts to its Google Pay name', () => {
        expect.hasAssertions();

        expect(
            getAndroidCardNetworks([
                SupportedNetworkEnum.Amex,
                SupportedNetworkEnum.Discover,
                SupportedNetworkEnum.Electron,
                SupportedNetworkEnum.Elo,
                SupportedNetworkEnum.Interac,
                SupportedNetworkEnum.Jcb,
                SupportedNetworkEnum.Maestro,
                SupportedNetworkEnum.Mastercard,
                SupportedNetworkEnum.Visa,
            ])
        ).toStrictEqual([
            AndroidAllowedCardNetworksEnum.AMEX,
            AndroidAllowedCardNetworksEnum.DISCOVER,
            AndroidAllowedCardNetworksEnum.ELECTRON,
            AndroidAllowedCardNetworksEnum.ELO,
            AndroidAllowedCardNetworksEnum.INTERAC,
            AndroidAllowedCardNetworksEnum.JCB,
            AndroidAllowedCardNetworksEnum.MAESTRO,
            AndroidAllowedCardNetworksEnum.MASTERCARD,
            AndroidAllowedCardNetworksEnum.VISA,
        ]);
    });

    it('drops networks Google Pay does not accept instead of sending invalid names', () => {
        expect.hasAssertions();

        expect(
            getAndroidCardNetworks([
                SupportedNetworkEnum.Visa,
                SupportedNetworkEnum.Bancontact,
                SupportedNetworkEnum.CartesBancaires,
                SupportedNetworkEnum.Mir,
            ])
        ).toStrictEqual([AndroidAllowedCardNetworksEnum.VISA]);
    });
});
