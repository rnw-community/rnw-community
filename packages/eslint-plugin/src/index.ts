import pkg from '../package.json';

import { rules } from './rules';

import type { ESLint } from 'eslint';

interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
    rules: typeof rules;
}

const namespace = pkg.name.split('/')[0] ?? '@rnw-community';

const plugin: Plugin = {
    meta: {
        name: pkg.name,
        version: pkg.version,
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
