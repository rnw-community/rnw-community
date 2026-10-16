import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { isDefined } from '@rnw-community/shared';

import { isTsDocComment } from './is-tsdoc-comment';

import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

const EXPORT_WRAPPERS = new Set<string>([AST_NODE_TYPES.ExportNamedDeclaration, AST_NODE_TYPES.ExportDefaultDeclaration]);

const getAttachmentNode = (node: TSESTree.Node): TSESTree.Node => {
    const statement = node.type === AST_NODE_TYPES.VariableDeclarator ? node.parent : node;

    return isDefined(statement.parent) && EXPORT_WRAPPERS.has(statement.parent.type) ? statement.parent : statement;
};

const getLeadingNode = (node: TSESTree.Node): TSESTree.Node => {
    const attachmentNode = getAttachmentNode(node);
    const decorators: TSESTree.Node[] = 'decorators' in node ? node.decorators : [];

    return [attachmentNode, ...decorators].reduce((leading, candidate) =>
        candidate.range[0] < leading.range[0] ? candidate : leading
    );
};

const isLintPragma = (comment: TSESTree.Comment): boolean =>
    comment.type === AST_TOKEN_TYPES.Line && comment.value.trim().startsWith('eslint-');

export const getTsDocComment = (sourceCode: TSESLint.SourceCode, node: TSESTree.Node): TSESTree.Comment | undefined => {
    const docCandidate = sourceCode
        .getCommentsBefore(getLeadingNode(node))
        .filter(comment => !isLintPragma(comment))
        .pop();

    return isDefined(docCandidate) && isTsDocComment(docCandidate) ? docCandidate : void 0;
};
