import { isArray, isDefined, isNotEmptyArray, isNotEmptyString, isString } from '@rnw-community/shared';

import { validateGooglePayEnvironment } from '../../expo-plugins/validate-google-pay-environment.util';
import { validateSupportedNetworks } from '../../expo-plugins/validate-supported-networks.util';

import type { PaymentsConfig } from '../../interface/payments-config.interface';
import type { ResolvedPaymentsConfig } from '../../interface/resolved-payments-config.interface';

const isMerchantIdentifierValue = (value: unknown): value is string[] | string =>
    isString(value) || (isArray(value) && value.every(isString));

/**
 * Validates a `PaymentsConfig` and applies its defaults, the one check shared by the Expo plugin, the doctor and runtime method data.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payments-config.md
 */
export const resolvePaymentsConfig = (config: PaymentsConfig): ResolvedPaymentsConfig => {
    if (isDefined(config.merchantIdentifier) && !isMerchantIdentifierValue(config.merchantIdentifier)) {
        throw new Error(
            `Invalid "merchantIdentifier" payments config value: ${JSON.stringify(config.merchantIdentifier)}. Expected a string or an array of strings`
        );
    }

    const merchantIdentifiers = [...new Set([config.merchantIdentifier].flat().filter(isNotEmptyString))];

    if (!isNotEmptyArray(merchantIdentifiers)) {
        throw new Error('Please provide a non-empty "merchantIdentifier" payments config value');
    }

    return {
        merchantIdentifiers,
        supportedNetworks: validateSupportedNetworks(config.supportedNetworks),
        googlePayEnvironment: validateGooglePayEnvironment(config.googlePayEnvironment),
    };
};
