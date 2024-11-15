import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

// TODO: Add url?
const createRule = ESLintUtils.RuleCreator(() => `https://github.com/rnw-community/rnw-community/eslint-plugin`);

export const noComplexJsxLogicRule = createRule({
    name: 'no-complex-jsx-logic',
    meta: {
        docs: {
            description: 'Prevent complex logic in JSX',
        },
        messages: {
            noInlineCallbacks: 'Inline callbacks should not be used inside JSX; they are created on each render.',
            noTernaryCallbackArguments: 'Conditional expressions should not be used in callback arguments in JSX.',
            noPropsCalculations: 'Complex logic (calculations) should not be used in JSX props.',
            noPropsTernary: 'Complex logic (ternary or logical operators) should not be used in JSX props.',
            noPropsInlineObjects: 'Inline objects should not be used in JSX props.',
            noPropsInlineArrays: 'Inline arrays should not be used in JSX props.',
        },
        type: 'suggestion',
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        return {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            JSXExpressionContainer(node): void {
                const { expression } = node;

                if (node.parent.type === AST_NODE_TYPES.JSXAttribute) {
                    if (expression.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                        context.report({ node, messageId: 'noInlineCallbacks' });
                    } else if (
                        expression.type === AST_NODE_TYPES.BinaryExpression &&
                        !['===', '!=='].includes(expression.operator)
                    ) {
                        context.report({ node, messageId: 'noPropsCalculations' });
                    } else if (expression.type === AST_NODE_TYPES.ConditionalExpression) {
                        context.report({ node, messageId: 'noPropsTernary' });
                    } else if (expression.type === AST_NODE_TYPES.LogicalExpression && expression.operator !== '??') {
                        context.report({ node, messageId: 'noPropsTernary' });
                    } else if (expression.type === AST_NODE_TYPES.CallExpression) {
                        expression.arguments.forEach(arg => {
                            if (arg.type === AST_NODE_TYPES.ConditionalExpression) {
                                context.report({ node, messageId: 'noTernaryCallbackArguments' });
                            }
                        });
                    } else if (expression.type === AST_NODE_TYPES.ObjectExpression) {
                        context.report({ node, messageId: 'noPropsInlineObjects' });
                    } else if (expression.type === AST_NODE_TYPES.ArrayExpression) {
                        context.report({ node, messageId: 'noPropsInlineArrays' });
                    }
                }
            },
        };
    },
});
