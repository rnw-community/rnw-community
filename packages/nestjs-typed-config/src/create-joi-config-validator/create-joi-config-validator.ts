import { isDefined } from '@rnw-community/shared';

import type Joi from 'joi';

export const createJoiConfigValidator =
    <C>(validationSchema: Joi.ObjectSchema<C>) =>
    (config: Record<string, unknown>): C => {
        const result = validationSchema.validate(config, { abortEarly: false, allowUnknown: true });

        if (isDefined(result.error)) {
            throw new Error(`Config validation error: ${result.error.message}`);
        }

        return result.value as C;
    };
