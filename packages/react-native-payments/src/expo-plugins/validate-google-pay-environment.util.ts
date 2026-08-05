import { isDefined } from '@rnw-community/shared';

import { EnvironmentEnum } from '../enum/environment.enum.js';

import { PLUGIN_DEFAULT_OPTIONS } from './plugin-default-options.constant.js';

const validEnvironments: readonly string[] = Object.values(EnvironmentEnum);

export const validateGooglePayEnvironment = (googlePayEnvironment: EnvironmentEnum | undefined): EnvironmentEnum => {
    if (!isDefined(googlePayEnvironment)) {
        return PLUGIN_DEFAULT_OPTIONS.googlePayEnvironment;
    }

    if (!validEnvironments.includes(googlePayEnvironment)) {
        const validEnvironmentList = validEnvironments.map(environment => `"${environment}"`).join(', ');

        throw new Error(
            `Invalid "googlePayEnvironment" plugin option value: "${googlePayEnvironment}". Valid values: ${validEnvironmentList}`
        );
    }

    return googlePayEnvironment;
};
