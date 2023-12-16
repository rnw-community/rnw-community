import { rules } from './rules';

import type { ESLint } from 'eslint';
interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
    rules: typeof rules;
}

const plugin: Plugin = {
    rules,
};

export = plugin;
