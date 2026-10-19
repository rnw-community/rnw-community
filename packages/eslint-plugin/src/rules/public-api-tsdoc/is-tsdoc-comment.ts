import { AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import type { TSESTree } from '@typescript-eslint/utils';

export const isTsDocComment = (comment: TSESTree.Comment): boolean =>
    comment.type === AST_TOKEN_TYPES.Block && comment.value.startsWith('*');
