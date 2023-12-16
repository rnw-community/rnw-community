import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

// TODO: Add url?
const createRule = ESLintUtils.RuleCreator(() => `https://github.com/rnw-community/rnw-community/eslint-plugin-rnw`);

const noComplexJsxLogic = createRule({
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
        },
        type: 'suggestion',
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        return {
            JSXExpressionContainer(node) {
                const { expression } = node;

                if (expression.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                    context.report({ node, messageId: 'noInlineCallbacks' });
                } else if (node.parent.type === AST_NODE_TYPES.JSXAttribute) {
                    if (expression.type === AST_NODE_TYPES.BinaryExpression) {
                        context.report({ node, messageId: 'noPropsCalculations' });
                    } else if (expression.type === AST_NODE_TYPES.ConditionalExpression) {
                        context.report({ node, messageId: 'noPropsTernary' });
                    } else if (expression.type === AST_NODE_TYPES.LogicalExpression) {
                        context.report({ node, messageId: 'noPropsTernary' });
                    } else if (expression.type === AST_NODE_TYPES.CallExpression) {
                        expression.arguments.forEach(arg => {
                            if (arg.type === AST_NODE_TYPES.ConditionalExpression) {
                                context.report({ node, messageId: 'noTernaryCallbackArguments' });
                            }
                        });
                    }
                }
            },
        };
    },
});

export default noComplexJsxLogic;
