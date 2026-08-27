import { describe, expect, it } from '@jest/globals';

import { importTypeormWebpackMigrations } from './import-typeorm-webpack-migrations.util';

const migrationA = (): string => 'MigrationA';
const migrationB = (): string => 'MigrationB';

const modules: Record<string, Record<string, unknown>> = {
    './2000000000000-second.ts': { MigrationB: migrationB, notAMigration: 'metadata' },
    './1000000000000-first.ts': { MigrationA: migrationA },
};

const requireContext = Object.assign((filename: string) => modules[filename], {
    keys: () => Object.keys(modules),
    resolve: (filename: string) => filename,
    id: 'migrations',
}) as unknown as __WebpackModuleApi.RequireContext;

describe('importTypeormWebpackMigrations', () => {
    it('returns migration classes sorted by filename with non-function exports filtered out', () => {
        expect.assertions(1);

        expect(importTypeormWebpackMigrations(requireContext)).toStrictEqual([migrationA, migrationB]);
    });
});
