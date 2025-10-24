import pkg from '../package.json';

import { rules } from './rules';

import type { ESLint } from 'eslint';

interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
    rules: typeof rules;
}

const plugin: Plugin = {
    meta: {
        name: pkg.name,
        version: pkg.version,
    },
    configs: {},
    rules,
};

Object.assign(plugin.configs ?? {}, {
    recommended: [
        {
            plugins: { example: plugin },
            rules: { 'no-complex-jsx-logic': 'error' },
        },
    ],
});

export = plugin;
