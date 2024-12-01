import { noComplexJsxLogicRule } from './no-complex-jsx-logic/no-complex-jsx-logic.rule';

import type { TSESLint } from '@typescript-eslint/utils';

export const rules = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'no-complex-jsx-logic': noComplexJsxLogicRule,
} satisfies Record<string, TSESLint.RuleModule<string, unknown[]>>;
