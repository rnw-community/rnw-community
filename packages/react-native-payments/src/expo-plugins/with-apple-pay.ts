import fs from 'fs';
import path from 'path';

import { withDangerousMod, withEntitlementsPlist } from 'expo/config-plugins';

import { isDefined } from '@rnw-community/shared';

import type { ReactNativePaymentsPluginProps } from './plugin.props';
import type { ConfigPlugin } from 'expo/config-plugins';

export const withApplePay: ConfigPlugin<ReactNativePaymentsPluginProps> = (initialConfig, { merchantIdentifier }) => {
    if (!isDefined(merchantIdentifier)) {
        throw new Error(`Pleas provide "@rnw-community/react-native-payments" plugin option "merchantIdentifier"`);
    }

    const configWithPassKit = withDangerousMod(initialConfig, [
        'ios',
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        async config => {
            const filePath = path.join(
                config.modRequest.platformProjectRoot,
                config.modRequest.projectName ?? '',
                'AppDelegate.h'
            );

            const content = fs.readFileSync(filePath, 'utf8');
            if (!content.includes('#import <PassKit/PassKit.h>')) {
                fs.writeFileSync(filePath, `#import <PassKit/PassKit.h>\n${content}`);
            }

            return Promise.resolve(config);
        },
    ]);

    return withEntitlementsPlist(configWithPassKit, configWithEntitlements => {
        if (merchantIdentifier) {
            if (!isDefined(configWithEntitlements.modResults['com.apple.developer.in-app-payments'])) {
                configWithEntitlements.modResults['com.apple.developer.in-app-payments'] = [];
            }

            const applePayArray = configWithEntitlements.modResults['com.apple.developer.in-app-payments'] as string[];
            if (!applePayArray.includes(merchantIdentifier)) {
                applePayArray.push(merchantIdentifier);
            }
        }

        return configWithEntitlements;
    });
};
