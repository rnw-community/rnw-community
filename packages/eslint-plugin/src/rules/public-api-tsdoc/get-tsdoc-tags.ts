import { isDefined } from '@rnw-community/shared';

import type { TSESTree } from '@typescript-eslint/utils';

const TAG_LINE = /^[\s*]*@(\w+)/u;

export const getTsDocTags = (comment: TSESTree.Comment): string[] =>
    comment.value
        .split('\n')
        .map(line => TAG_LINE.exec(line)?.[1])
        .filter(isDefined);
