import { withEntitlementsPlist } from '@expo/config-plugins';

import { isArray, isString } from '@rnw-community/shared';

import type { ResolvedPaymentsConfig } from '../interface/resolved-payments-config.interface';
import type { ConfigPlugin } from '@expo/config-plugins';

const inAppPaymentsEntitlement = 'com.apple.developer.in-app-payments';

export const withApplePay: ConfigPlugin<ResolvedPaymentsConfig> = (initialConfig, { merchantIdentifiers }) =>
    withEntitlementsPlist(initialConfig, config => {
        const declaredIdentifiers: unknown = config.modResults[inAppPaymentsEntitlement];
        const existingIdentifiers = isArray(declaredIdentifiers) ? declaredIdentifiers.filter(isString) : [];

        config.modResults[inAppPaymentsEntitlement] = [...new Set([...existingIdentifiers, ...merchantIdentifiers])];

        return config;
    });
