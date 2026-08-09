import { withEntitlementsPlist } from '@expo/config-plugins';

import { isDefined, isEmptyArray, isNotEmptyString } from '@rnw-community/shared';

import type { ReactNativePaymentsPluginProps } from './plugin.props';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withApplePay: ConfigPlugin<ReactNativePaymentsPluginProps> = (initialConfig, { merchantIdentifier }) => {
    const merchantIdentifiers = (Array.isArray(merchantIdentifier) ? merchantIdentifier : [merchantIdentifier]).filter(
        isNotEmptyString
    );

    if (isEmptyArray(merchantIdentifiers)) {
        throw new Error(`Please provide "@rnw-community/react-native-payments" plugin option "merchantIdentifier"`);
    }

    return withEntitlementsPlist(initialConfig, configWithEntitlements => {
        if (!isDefined(configWithEntitlements.modResults['com.apple.developer.in-app-payments'])) {
            configWithEntitlements.modResults['com.apple.developer.in-app-payments'] = [];
        }

        const applePayArray = configWithEntitlements.modResults['com.apple.developer.in-app-payments'] as string[];
        for (const identifier of merchantIdentifiers) {
            if (!applePayArray.includes(identifier)) {
                applePayArray.push(identifier);
            }
        }

        return configWithEntitlements;
    });
};
