import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { isDefined } from '@rnw-community/shared';

import type { PaymentsConfig } from '../../interface/payments-config.interface';

const paymentsConfigFileNames = ['payments.config.ts', 'payments.config.js', 'payments.config.json'];

export const loadPaymentsConfig = (projectRoot: string): PaymentsConfig => {
    const configPath = paymentsConfigFileNames.map(name => join(projectRoot, name)).find(path => existsSync(path));

    if (!isDefined(configPath)) {
        throw new Error(
            `Please provide the payments config: none of ${paymentsConfigFileNames.join(', ')} found in "${projectRoot}"`
        );
    }

    const loaded = createRequire(configPath)(configPath) as PaymentsConfig | { default: PaymentsConfig };

    return 'default' in loaded ? loaded.default : loaded;
};
