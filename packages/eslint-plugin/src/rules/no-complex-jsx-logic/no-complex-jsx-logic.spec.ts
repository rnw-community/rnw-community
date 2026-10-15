import { describe, expect, it } from '@jest/globals';
import { RuleTester } from '@typescript-eslint/rule-tester';

import { noComplexJsxLogicRule } from './no-complex-jsx-logic.rule';

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 2018,
            ecmaFeatures: { jsx: true },
            sourceType: 'module',
        },
    },
});

ruleTester.run('no-complex-jsx-logic', noComplexJsxLogicRule, {
    valid: [
        {
            code: '<Component prop={simpleValue} />',
        },
        {
            code: '<Component prop={simpleValue === scalar} />',
        },
        {
            code: '<Component prop={simpleValue !== scalar} />',
        },
        {
            code: `<Component prop={simpleValue ?? ''} />`,
        },
        {
            code: '<Component>{simpleContent}</Component>',
        },
        {
            code: '<Component>{handleLogic()}</Component>',
        },
        {
            code: '<Component>{handleLogic(args)}</Component>',
        },
        {
            code: '<Component onClick={handleClick(value)} />',
        },
        {
            code: '<Component>{condition && <AnotherComponent />}</Component>',
        },
        {
            code: '<Component>{condition ? <AnotherComponent /> : <FallbackComponent />}</Component>',
        },
        {
            code: '<Component>{condition => (<AnotherComponent />)}</Component>',
        },
    ],

    invalid: [
        {
            code: '<Component prop={condition ? "value1" : "value2"} />',
            errors: [{ messageId: 'noPropsTernary' }],
        },
        {
            code: '<Component prop={myVar + myVar2} />',
            errors: [{ messageId: 'noPropsCalculations' }],
        },
        {
            code: '<Component prop={condition && value} />',
            errors: [{ messageId: 'noPropsTernary' }],
        },
        {
            code: '<Component objectProp={{ field: 1, boolField: true}} />',
            errors: [{ messageId: 'noPropsInlineObjects' }],
        },
        {
            code: '<Component objectProp={[ 1, 2 ]} />',
            errors: [{ messageId: 'noPropsInlineArrays' }],
        },
        {
            code: '<Component onClick={() => doSomething()} />',
            errors: [{ messageId: 'noInlineCallbacks' }],
        },
        {
            code: '<Component onClick={handleClick(condition ? "1" : "2")} />',
            errors: [{ messageId: 'noTernaryCallbackArguments' }],
        },
    ],
});

describe('no-complex-jsx-logic metadata', () => {
    it('links its documentation to the rule page in the repository', () => {
        expect.hasAssertions();

        expect(noComplexJsxLogicRule.meta.docs?.url).toBe(
            'https://github.com/rnw-community/rnw-community/blob/master/packages/eslint-plugin/src/rules/no-complex-jsx-logic/no-complex-jsx-logic.md'
        );
    });
});
