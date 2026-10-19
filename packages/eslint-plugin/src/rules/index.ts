import { noComplexJsxLogicRule } from './no-complex-jsx-logic/no-complex-jsx-logic.rule';
import { publicApiTsDocRule } from './public-api-tsdoc/public-api-tsdoc.rule';

import type { TSESLint } from '@typescript-eslint/utils';

export const rules = {
    'no-complex-jsx-logic': noComplexJsxLogicRule,
    'public-api-tsdoc': publicApiTsDocRule,
} satisfies Record<string, TSESLint.RuleModule<string, unknown[]>>;
