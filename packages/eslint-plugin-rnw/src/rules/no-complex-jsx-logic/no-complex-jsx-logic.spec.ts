import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from './no-complex-jsx-logic.rule';

const ruleTester = new RuleTester({
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
    },
});

ruleTester.run('no-complex-jsx-logic', rule, {
    valid: [
        {
            code: '<Component prop={simpleValue} />',
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
            code: '<Component>{condition && <AnotherComponent />}</Component>',
        },
        {
            code: '<Component>{condition ? <AnotherComponent /> : <FallbackComponent />}</Component>',
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
            code: '<Component onClick={() => doSomething()} />',
            errors: [{ messageId: 'noInlineCallbacks' }],
        },
        {
            code: '<Component onClick={handleClick(condition ? "1" : "2")} />',
            errors: [{ messageId: 'noTernaryCallbackArguments' }],
        },
    ],
});
