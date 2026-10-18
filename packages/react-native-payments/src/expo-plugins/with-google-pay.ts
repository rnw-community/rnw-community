import { AndroidConfig, withAndroidManifest } from '@expo/config-plugins';

import type { ResolvedPaymentsConfig } from '../interface/resolved-payments-config.interface';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withGooglePay: ConfigPlugin<ResolvedPaymentsConfig> = (
    initialConfig,
    { supportedNetworks, googlePayEnvironment }
) =>
    withAndroidManifest(initialConfig, config => {
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'com.google.android.gms.wallet.api.enabled',
            'true'
        );
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'com.google.android.gms.wallet.api.environment',
            googlePayEnvironment
        );
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'com.rnw-community.react-native-payments.supported-networks',
            supportedNetworks.join(',')
        );

        return config;
    });
