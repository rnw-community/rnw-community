import { isDefined } from '@rnw-community/shared';

import { EnvironmentEnum } from '../enum/environment.enum';

import { PLUGIN_DEFAULT_OPTIONS } from './plugin-default-options.constant';

const validEnvironments: readonly string[] = Object.values(EnvironmentEnum);

const isEnvironment = (environment: string): environment is EnvironmentEnum => validEnvironments.includes(environment);

export const validateGooglePayEnvironment = (googlePayEnvironment: string | undefined): EnvironmentEnum => {
    if (!isDefined(googlePayEnvironment)) {
        return PLUGIN_DEFAULT_OPTIONS.googlePayEnvironment;
    }

    if (!isEnvironment(googlePayEnvironment)) {
        const validEnvironmentList = validEnvironments.map(environment => `"${environment}"`).join(', ');

        throw new Error(
            `Invalid "googlePayEnvironment" payments config value: "${googlePayEnvironment}". Valid values: ${validEnvironmentList}`
        );
    }

    return googlePayEnvironment;
};
