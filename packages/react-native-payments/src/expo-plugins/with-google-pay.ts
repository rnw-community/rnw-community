import { AndroidConfig, withAndroidManifest } from '@expo/config-plugins';

import { validateGooglePayEnvironment } from './validate-google-pay-environment.util';
import { validateSupportedNetworks } from './validate-supported-networks.util';

import type { ReactNativePaymentsPluginProps } from './plugin.props';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withGooglePay: ConfigPlugin<ReactNativePaymentsPluginProps> = (
    initialConfig,
    { supportedNetworks, googlePayEnvironment }
) => {
    const validatedSupportedNetworks = validateSupportedNetworks(supportedNetworks);
    const validatedGooglePayEnvironment = validateGooglePayEnvironment(googlePayEnvironment);

    return withAndroidManifest(initialConfig, config => {
        const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'com.google.android.gms.wallet.api.enabled',
            'true'
        );
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'com.google.android.gms.wallet.api.environment',
            validatedGooglePayEnvironment
        );
        AndroidConfig.Manifest.addMetaDataItemToMainApplication(
            mainApplication,
            'com.rnw-community.react-native-payments.supported-networks',
            validatedSupportedNetworks.join(',')
        );

        return config;
    });
};
