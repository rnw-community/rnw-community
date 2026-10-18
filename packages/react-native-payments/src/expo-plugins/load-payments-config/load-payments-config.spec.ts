import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import { loadPaymentsConfig } from './load-payments-config.util';

const createProjectRoot = (files: Record<string, string>): string => {
    const projectRoot = mkdtempSync(join(tmpdir(), 'payments-config-'));

    for (const [name, contents] of Object.entries(files)) {
        writeFileSync(join(projectRoot, name), contents);
    }

    return projectRoot;
};

describe('loadPaymentsConfig', () => {
    it('should load a JSON payments config', () => {
        expect.hasAssertions();

        const projectRoot = createProjectRoot({ 'payments.config.json': '{ "merchantIdentifier": "merchant.json" }' });

        expect(loadPaymentsConfig(projectRoot)).toStrictEqual({ merchantIdentifier: 'merchant.json' });
    });

    it('should load a CommonJS payments config', () => {
        expect.hasAssertions();

        const projectRoot = createProjectRoot({
            'payments.config.js': 'module.exports = { merchantIdentifier: "merchant.js" };',
        });

        expect(loadPaymentsConfig(projectRoot)).toStrictEqual({ merchantIdentifier: 'merchant.js' });
    });

    it('should unwrap the default export and prefer the TypeScript payments config', () => {
        expect.hasAssertions();

        const projectRoot = createProjectRoot({
            'payments.config.ts': 'exports.default = { merchantIdentifier: "merchant.ts" };',
            'payments.config.json': '{ "merchantIdentifier": "merchant.json" }',
        });

        expect(loadPaymentsConfig(projectRoot)).toStrictEqual({ merchantIdentifier: 'merchant.ts' });
    });

    it('should throw naming every supported file when no payments config exists', () => {
        expect.hasAssertions();

        const projectRoot = createProjectRoot({});

        expect(() => loadPaymentsConfig(projectRoot)).toThrow(
            `Please provide the payments config: none of payments.config.ts, payments.config.js, payments.config.json found in "${projectRoot}"`
        );
    });
});
