import { withAndroidManifest, withAppBuildGradle } from '@expo/config-plugins';

import type { ReactNativePaymentsPluginProps } from './plugin.props';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withGooglePay: ConfigPlugin<ReactNativePaymentsPluginProps> = initialConfig => {
    const withAppBuildGradleConfig = withAppBuildGradle(initialConfig, config => {
        if (config.modResults.language === 'groovy') {
            config.modResults.contents = config.modResults.contents.replace(
                /dependencies\s?\{/u,
                `dependencies {
    implementation 'com.google.android.gms:play-services-wallet:19.2.0'`
            );
        } else {
            throw new Error('Unable to add Google Pay dependency to build.gradle: Kotlin build files are not supported.');
        }

        return config;
    });

    return withAndroidManifest(withAppBuildGradleConfig, config => {
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
};
