import path from 'path';

import { describe, expect, it } from '@jest/globals';

import { isNotEmptyArray } from '@rnw-community/shared';

import { swcConfig } from '../swc.config';

import { getNestJSWebpackGenericConfig } from './get-nestjs-webpack-generic.config';

import type { RuleSetRule } from 'webpack';

const getSwcRule = (config: ReturnType<typeof getNestJSWebpackGenericConfig>): RuleSetRule | undefined => {
    const rules = (config.module?.rules ?? []) as RuleSetRule[];

    return isNotEmptyArray(rules) ? rules[0] : void 0;
};

describe('getNestJSWebpackGenericConfig', () => {
    it('extends the passed options with node externals, filesystem cache and the swc loader rule', () => {
        expect.assertions(5);

        const config = getNestJSWebpackGenericConfig({ target: 'node' });

        expect(config.target).toBe('node');
        expect(config.externals).toStrictEqual([expect.any(Function)]);
        expect(config.externalsPresets).toStrictEqual({ node: true });
        expect(config.cache).toStrictEqual({
            type: 'filesystem',
            cacheDirectory: path.resolve(process.cwd(), '.build_cache'),
            allowCollectingMemory: true,
        });
        expect(config.node).toStrictEqual({ __dirname: false, __filename: false });
    });

    it('merges custom swc options over the base swc config in the loader rule', () => {
        expect.assertions(1);

        const config = getNestJSWebpackGenericConfig({}, { minify: true });

        expect(getSwcRule(config)?.use).toStrictEqual({
            loader: 'swc-loader',
            options: { ...swcConfig, minify: true },
        });
    });

    it('normalizes both array and single-entry allow lists into a node-externals matcher', () => {
        expect.assertions(2);

        expect(getNestJSWebpackGenericConfig({}, {}, ['pkg-a', 'pkg-b']).externals).toStrictEqual([expect.any(Function)]);
        expect(getNestJSWebpackGenericConfig({}, {}, 'single-pkg').externals).toStrictEqual([expect.any(Function)]);
    });
});
