# ESLint Rule: `no-complex-jsx-logic`

## Description

This ESLint rule enforces a cleaner and more maintainable JSX structure by disallowing complex logic expressions directly in JSX and JSX props. The rule checks for ternary operators, logical operators, and complex calculations within JSX and JSX props, and inline callbacks and conditional expressions in callback arguments.

## Rule Details

This rule aims to improve the readability and maintainability of JSX code by enforcing the following guidelines:

- Complex logic (ternary or logical operators) should not be used directly inside JSX or in JSX props.
- Complex calculations should not be used in JSX props.
- Inline callbacks should not be avoided inside JSX, as they are created on each render.
- Conditional expressions should not be used in callback arguments in JSX.

Examples of **incorrect** code for this rule:

```jsx
<Component prop={condition ? "value1" : "value2"} />
<Component prop={myVar + myVar2} />
<Component onClick={() => doSomething()} />
<Component onClick={handleClick(condition ? "1" : "2")} />
```

Examples of correct code for this rule:
```jsx
<Component prop={simpleValue} />
<Component>{simpleContent}</Component>
<Component>{handleLogic()}</Component>
<Component>{handleLogic(args)}</Component>
<Component>{condition && <AnotherComponent />}</Component>
<Component>{condition ? <AnotherComponent /> : <FallbackComponent />}</Component>
```

## Usage
To use this rule, add it to your ESLint configuration file:

```json
{
  "rules": {
    "no-complex-jsx-logic": "error"
  }
}
```
