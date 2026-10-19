import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import { isDefined, isRecord } from '@rnw-community/shared';

import type { PaymentsConfig } from '../../interface/payments-config.interface';

const paymentsConfigFileNames = ['payments.config.ts', 'payments.config.js', 'payments.config.json'];

const hasDefaultExport = (loadedModule: unknown): loadedModule is { default: unknown } =>
    isRecord(loadedModule) && 'default' in loadedModule;

export const loadPaymentsConfig = (projectRoot: string): PaymentsConfig => {
    const configPath = paymentsConfigFileNames.map(name => join(projectRoot, name)).find(path => existsSync(path));

    if (!isDefined(configPath)) {
        throw new Error(
            `Please provide the payments config: none of ${paymentsConfigFileNames.join(', ')} found in "${projectRoot}"`
        );
    }

    const loadedModule: unknown = createRequire(configPath)(configPath);
    const loadedConfig: unknown = hasDefaultExport(loadedModule) ? loadedModule.default : loadedModule;

    if (!isRecord(loadedConfig)) {
        throw new Error(`Invalid payments config in "${configPath}": expected an object export`);
    }

    return loadedConfig as unknown as PaymentsConfig;
};
