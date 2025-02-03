import { withAndroidManifest } from '@expo/config-plugins';

import type { ReactNativePaymentsPluginProps } from './plugin.props';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withGooglePay: ConfigPlugin<ReactNativePaymentsPluginProps> = initialConfig =>
    withAndroidManifest(initialConfig, config => {
        const androidManifest = config.modResults;
        const mainApplication = androidManifest.manifest.application?.[0];

        if (mainApplication) {
            const existingMetaData = mainApplication['meta-data']?.find(
                metadata => metadata.$['android:name'] === 'com.google.android.gms.wallet.api.enabled'
            );

            if (!existingMetaData) {
                if (!mainApplication['meta-data']) {
                    mainApplication['meta-data'] = [];
                }
                mainApplication['meta-data'].push({
                    // eslint-disable-next-line id-length
                    $: {
                        'android:name': 'com.google.android.gms.wallet.api.enabled',
                        'android:value': 'true',
                    },
                });
            }
        }

        return config;
    });
