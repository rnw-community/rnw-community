import noComplexJsxLogicRule from './rules/no-complex-jsx-logic/no-complex-jsx-logic.rule';

import type { ESLint } from 'eslint';

const rules: Record<string, typeof noComplexJsxLogicRule> = {
    'no-complex-jsx-logic': noComplexJsxLogicRule,
};

interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
    rules: typeof rules;
}

const plugin: Plugin = {
    rules: {
        'no-complex-jsx-logic': noComplexJsxLogicRule,
    },
};

export default plugin;
