import { describe, expect, it, jest } from '@jest/globals';

import { EnvironmentEnum } from '../enum/environment.enum.js';
import { SupportedNetworkEnum } from '../enum/supported-networks.enum.js';

import { withGooglePay } from './with-google-pay.js';

jest.mock('@expo/config-plugins', () => ({
    ...jest.requireActual<typeof import('@expo/config-plugins')>('@expo/config-plugins'),
    withAndroidManifest: jest.fn((config: unknown, modifier: (config: unknown) => unknown) => modifier(config)),
}));

const ENABLED_META_DATA_NAME = 'com.google.android.gms.wallet.api.enabled';
const ENVIRONMENT_META_DATA_NAME = 'com.google.android.gms.wallet.api.environment';
const SUPPORTED_NETWORKS_META_DATA_NAME = 'com.rnw-community.react-native-payments.supported-networks';

type MetaDataItem = { $: { 'android:name': string; 'android:value': string } };

const createConfig = (metaData: MetaDataItem[] = []) => ({
    name: 'test',
    slug: 'test',
    modResults: {
        manifest: {
            application: [
                {
                    // eslint-disable-next-line id-length
                    $: { 'android:name': '.MainApplication' },
                    'meta-data': metaData,
                },
            ],
        },
    },
});

const runPlugin = (
    props: { merchantIdentifier: string; supportedNetworks?: SupportedNetworkEnum[]; googlePayEnvironment?: EnvironmentEnum },
    metaData?: MetaDataItem[]
) => {
    const result = withGooglePay(createConfig(metaData), props) as unknown as {
        modResults: { manifest: { application: [{ 'meta-data': MetaDataItem[] }] } };
    };

    return result.modResults.manifest.application[0]['meta-data'];
};

const findMetaDataValue = (metaData: MetaDataItem[], name: string) =>
    metaData.find(item => item.$['android:name'] === name)?.$['android:value'];

describe('withGooglePay', () => {
    it('should add the wallet enabled meta-data', () => {
        expect.assertions(1);

        const metaData = runPlugin({ merchantIdentifier: 'merchant.com.example' });

        expect(findMetaDataValue(metaData, ENABLED_META_DATA_NAME)).toBe('true');
    });

    it('should default the environment meta-data to PRODUCTION', () => {
        expect.assertions(1);

        const metaData = runPlugin({ merchantIdentifier: 'merchant.com.example' });

        expect(findMetaDataValue(metaData, ENVIRONMENT_META_DATA_NAME)).toBe(EnvironmentEnum.PRODUCTION);
    });

    it('should use the provided environment', () => {
        expect.assertions(1);

        const metaData = runPlugin({
            merchantIdentifier: 'merchant.com.example',
            googlePayEnvironment: EnvironmentEnum.TEST,
        });

        expect(findMetaDataValue(metaData, ENVIRONMENT_META_DATA_NAME)).toBe(EnvironmentEnum.TEST);
    });

    it('should default supportedNetworks meta-data to every supported network', () => {
        expect.assertions(1);

        const metaData = runPlugin({ merchantIdentifier: 'merchant.com.example' });

        expect(findMetaDataValue(metaData, SUPPORTED_NETWORKS_META_DATA_NAME)).toBe(
            Object.values(SupportedNetworkEnum).join(',')
        );
    });

    it('should use the provided supportedNetworks', () => {
        expect.assertions(1);

        const metaData = runPlugin({
            merchantIdentifier: 'merchant.com.example',
            supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
        });

        expect(findMetaDataValue(metaData, SUPPORTED_NETWORKS_META_DATA_NAME)).toBe('visa,masterCard');
    });

    it('should not duplicate the wallet enabled meta-data when it already exists', () => {
        expect.assertions(1);

        // eslint-disable-next-line id-length
        const existing = [{ $: { 'android:name': ENABLED_META_DATA_NAME, 'android:value': 'true' } }];

        const metaData = runPlugin({ merchantIdentifier: 'merchant.com.example' }, existing);

        expect(metaData.filter(item => item.$['android:name'] === ENABLED_META_DATA_NAME)).toHaveLength(1);
    });

    it('should throw when supportedNetworks is invalid', () => {
        expect.assertions(1);

        expect(() =>
            runPlugin({
                merchantIdentifier: 'merchant.com.example',
                supportedNetworks: ['not-a-network'] as never,
            })
        ).toThrow('Invalid "supportedNetworks" plugin option value(s): "not-a-network"');
    });

    it('should throw when googlePayEnvironment is invalid', () => {
        expect.assertions(1);

        expect(() =>
            runPlugin({
                merchantIdentifier: 'merchant.com.example',
                googlePayEnvironment: 'STAGING' as never,
            })
        ).toThrow('Invalid "googlePayEnvironment" plugin option value: "STAGING"');
    });

    it('should throw when the AndroidManifest has no MainApplication', () => {
        expect.assertions(1);

        const config = {
            name: 'test',
            slug: 'test',
            modResults: { manifest: { application: [] } },
        };

        expect(() => withGooglePay(config as never, { merchantIdentifier: 'merchant.com.example' })).toThrow(
            'AndroidManifest.xml is missing the required MainApplication element'
        );
    });
});
