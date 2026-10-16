import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

import { isDefined } from '@rnw-community/shared';

import { collectPublicApi } from './collect-public-api';
import { findPackage } from './find-package';
import { getTsDocComment } from './get-tsdoc-comment';
import { getTsDocTags } from './get-tsdoc-tags';
import { isTsDocComment } from './is-tsdoc-comment';

import type { PublicApiInterface } from './public-api.interface';
import type { TSESTree } from '@typescript-eslint/utils';

type ClassMethodNode = TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition;
type ClassPropertyNode = TSESTree.PropertyDefinition | TSESTree.TSAbstractPropertyDefinition;
type EntityNode =
    | TSESTree.ClassDeclaration
    | TSESTree.FunctionDeclaration
    | TSESTree.TSDeclareFunction
    | TSESTree.TSEnumDeclaration
    | TSESTree.TSInterfaceDeclaration
    | TSESTree.TSTypeAliasDeclaration
    | TSESTree.VariableDeclarator;
type TypeMemberNode =
    TSESTree.TSEnumMember | TSESTree.TSIndexSignature | TSESTree.TSMethodSignature | TSESTree.TSPropertySignature;
type VisibilityType = 'exported' | 'internal' | 'referenced';

const ENTITY_SELECTOR = [
    AST_NODE_TYPES.ClassDeclaration,
    AST_NODE_TYPES.FunctionDeclaration,
    AST_NODE_TYPES.TSDeclareFunction,
    AST_NODE_TYPES.TSEnumDeclaration,
    AST_NODE_TYPES.TSInterfaceDeclaration,
    AST_NODE_TYPES.TSTypeAliasDeclaration,
    AST_NODE_TYPES.VariableDeclarator,
].join(', ');
const ENTITY_TYPES = new Set<string>(ENTITY_SELECTOR.split(', '));
const PLATFORM_VARIANT = /\.(?:android|ios|native|web)(?=\.tsx?$)/u;
const EMPTY_PUBLIC_API: PublicApiInterface = { exported: new Set(), referenced: new Set(), exportedNamesByFile: new Map() };
const ENTITY_TAGS = ['see'];
const MEMBER_TAGS = ['defaultValue', 'see'];

const createRule = ESLintUtils.RuleCreator(
    name => `https://github.com/rnw-community/rnw-community/blob/master/packages/eslint-plugin/src/rules/${name}/${name}.md`
);

const isPublicClassElement = (node: ClassMethodNode | ClassPropertyNode): boolean =>
    node.accessibility !== 'private' &&
    node.accessibility !== 'protected' &&
    node.key.type !== AST_NODE_TYPES.PrivateIdentifier &&
    !(node.type === AST_NODE_TYPES.MethodDefinition && node.kind === 'constructor');

const findEnclosingEntity = (node: TSESTree.Node): EntityNode | undefined => {
    const ancestors: TSESTree.Node[] = [];

    for (let current = node.parent; isDefined(current); current = current.parent) {
        ancestors.push(current);
    }

    return ancestors.find(ancestor => ENTITY_TYPES.has(ancestor.type)) as EntityNode | undefined;
};

export const publicApiTsDocRule = createRule({
    name: 'public-api-tsdoc',
    meta: {
        docs: {
            description: 'Require scoped TSDoc on the package public API and forbid TSDoc everywhere else',
        },
        messages: {
            missingTsDoc: "Public API declaration '{{name}}' needs a one-sentence TSDoc block with @see links.",
            missingSeeTag: 'Public API TSDoc must link its canonical doc target with at least one @see tag.',
            forbiddenTag: "TSDoc tag '@{{tag}}' is not allowed here; allowed tags: {{allowed}}.",
            tsDocOutsidePublicApi: 'TSDoc is only allowed on the public API surface of the package and its members.',
        },
        type: 'suggestion',
        schema: [],
    },
    defaultOptions: [],
    // eslint-disable-next-line max-lines-per-function, max-statements
    create(context) {
        const services = ESLintUtils.getParserServices(context);
        const { sourceCode } = context;
        const fileName = context.filename.split('\\').join('/');
        const packageInfo = findPackage(context.filename);
        const publicApi =
            !isDefined(packageInfo) || packageInfo.manifest.private === true
                ? EMPTY_PUBLIC_API
                : collectPublicApi(services.program, packageInfo.dir, packageInfo.manifest);
        const claimedComments = new Set<TSESTree.Comment>();

        const getNodeName = (node: ClassMethodNode | EntityNode): string => {
            const nameNode = 'key' in node ? node.key : node.id;

            if (nameNode === null) {
                return 'default';
            }

            return nameNode.type === AST_NODE_TYPES.Identifier ? nameNode.name : sourceCode.getText(nameNode);
        };

        const isExportedPlatformVariant = (node: EntityNode): boolean => {
            const baseFileName = fileName.replace(PLATFORM_VARIANT, '');

            return (
                baseFileName !== fileName &&
                (publicApi.exportedNamesByFile.get(baseFileName)?.has(getNodeName(node)) ?? false)
            );
        };

        const getEntityVisibility = (node: EntityNode): VisibilityType => {
            const tsNode = services.esTreeNodeToTSNodeMap.get(node);

            if (publicApi.exported.has(tsNode) || isExportedPlatformVariant(node)) {
                return 'exported';
            }

            return publicApi.referenced.has(tsNode) ? 'referenced' : 'internal';
        };

        const getClassVisibility = (node: ClassMethodNode | ClassPropertyNode): VisibilityType =>
            isPublicClassElement(node) && node.parent.parent.type === AST_NODE_TYPES.ClassDeclaration
                ? getEntityVisibility(node.parent.parent)
                : 'internal';

        const hasSiblingMethod = (
            node: ClassMethodNode,
            isSibling: (sibling: TSESTree.MethodDefinition) => boolean
        ): boolean =>
            node.parent.body.some(
                sibling =>
                    sibling.type === AST_NODE_TYPES.MethodDefinition &&
                    sourceCode.getText(sibling.key) === sourceCode.getText(node.key) &&
                    isSibling(sibling)
            );

        const isDocumentedThroughSibling = (node: ClassMethodNode): boolean =>
            (node.value.type !== AST_NODE_TYPES.TSEmptyBodyFunctionExpression &&
                hasSiblingMethod(node, sibling => sibling.value.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression)) ||
            (node.kind === 'set' && hasSiblingMethod(node, sibling => sibling.kind === 'get'));

        const checkTags = (comment: TSESTree.Comment, allowedTags: readonly string[]): void => {
            for (const tag of getTsDocTags(comment).filter(candidate => !allowedTags.includes(candidate))) {
                context.report({
                    loc: comment.loc,
                    messageId: 'forbiddenTag',
                    data: { tag, allowed: allowedTags.join(', ') },
                });
            }
        };

        const requireTsDoc = (node: ClassMethodNode | EntityNode): void => {
            const comment = getTsDocComment(sourceCode, node);

            if (!isDefined(comment)) {
                context.report({ node, messageId: 'missingTsDoc', data: { name: getNodeName(node) } });

                return;
            }
            claimedComments.add(comment);
            checkTags(comment, ENTITY_TAGS);
            if (!getTsDocTags(comment).includes('see')) {
                context.report({ loc: comment.loc, messageId: 'missingSeeTag' });
            }
        };

        const allowTsDoc = (node: TSESTree.Node): void => {
            const comment = getTsDocComment(sourceCode, node);

            if (isDefined(comment)) {
                claimedComments.add(comment);
                checkTags(comment, MEMBER_TAGS);
            }
        };

        return {
            [ENTITY_SELECTOR](node: EntityNode): void {
                const visibility = getEntityVisibility(node);

                if (visibility === 'exported') {
                    requireTsDoc(node);
                } else if (visibility === 'referenced') {
                    allowTsDoc(node);
                }
            },
            'MethodDefinition, TSAbstractMethodDefinition'(node: ClassMethodNode): void {
                const visibility = getClassVisibility(node);

                if (visibility === 'referenced') {
                    allowTsDoc(node);
                } else if (visibility === 'exported' && !isDocumentedThroughSibling(node)) {
                    requireTsDoc(node);
                }
            },
            'PropertyDefinition, TSAbstractPropertyDefinition'(node: ClassPropertyNode): void {
                if (getClassVisibility(node) !== 'internal') {
                    allowTsDoc(node);
                }
            },
            'TSPropertySignature, TSMethodSignature, TSIndexSignature, TSEnumMember'(node: TypeMemberNode): void {
                const entity = findEnclosingEntity(node);

                if (isDefined(entity) && getEntityVisibility(entity) !== 'internal') {
                    allowTsDoc(node);
                }
            },
            'Program:exit'(): void {
                for (const comment of sourceCode.getAllComments()) {
                    if (isTsDocComment(comment) && !claimedComments.has(comment)) {
                        context.report({ loc: comment.loc, messageId: 'tsDocOutsidePublicApi' });
                    }
                }
            },
        };
    },
});
