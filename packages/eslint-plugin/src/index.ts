import { rules } from './rules';

import type { ESLint } from 'eslint';

interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
    rules: typeof rules;
}

const namespace = '@rnw-community';

/**
 * The `@rnw-community` ESLint plugin, exposing the `no-complex-jsx-logic` rule and `recommended` configs for legacy and flat config.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/eslint-plugin/readme.md#rnw-eslint-plugin
 */
const plugin: Plugin = {
    meta: {
        name: `${namespace}/eslint-plugin`,
        namespace,
    },
    configs: {},
    rules,
};

Object.assign(plugin.configs ?? {}, {
    recommended: [
        {
            plugins: [namespace],
            parserOptions: { ecmaFeatures: { jsx: true } },
            rules: {
                [`${namespace}/no-complex-jsx-logic`]: 'error',
            },
        },
    ],

    'flat/recommended': [
        {
            plugins: {
                [namespace]: plugin,
            },
            languageOptions: {
                parserOptions: { ecmaFeatures: { jsx: true } },
            },
            rules: {
                [`${namespace}/no-complex-jsx-logic`]: 'error',
            },
        },
    ],
});

export = plugin;
