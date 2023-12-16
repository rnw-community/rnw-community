# `no-complex-jsx-logic` Rule Documentation

## Overview

The `no-complex-jsx-logic` rule is designed to maintain the clarity and simplicity of JSX code in React applications. It enforces practices that prevent the embedding of complex logic within JSX, facilitating easier understanding, maintenance, and testing of components.

## Rule Description

This rule restricts the use of complex logic expressions directly inside JSX. It encourages developers to abstract complex logic away from JSX, promoting cleaner and more maintainable code. The rule defines specific patterns that are considered valid and invalid to guide developers in writing clearer JSX.

## Examples

### Valid Patterns

- Simple Prop Assignment:
  ```jsx
  <Component prop={simpleValue} />
  ```
- Equality Checks:
  ```jsx
  <Component prop={simpleValue === scalar} />
  ```
- Nullish Coalescing:
  ```jsx
  <Component prop={simpleValue ?? ''} />
  ```
- Simple Content Rendering:
  ```jsx
  <Component>{simpleContent}</Component>
  ```
- Conditional Rendering:
  ```jsx
  <Component>{condition && <AnotherComponent />}</Component>
  ```

### Invalid Patterns

- Ternary Operators in Props:
  ```jsx
  <Component prop={condition ? "value1" : "value2"} />
  ```
- Prop Calculations:
  ```jsx
  <Component prop={myVar + myVar2} />
  ```
- Inline Callbacks:
  ```jsx
  <Component onClick={() => doSomething()} />
  ```
- Complex Logic in Callback Arguments:
  ```jsx
  <Component onClick={handleClick(condition ? "1" : "2")} />
  ```

## Configuration

To use this rule, add it to your ESLint configuration file. Here's an example of how you might configure it:

```json
{
  "rules": {
    "no-complex-jsx-logic": "warn" // or "error" to enforce the rule strictly
  }
}
```

## Rationale

The main goal of this rule is to improve the readability and maintainability of JSX. By keeping JSX free of complex logic, the code becomes easier to understand, less prone to errors, and more straightforward to test.

## Further Reading

- [React Official Documentation](https://reactjs.org/docs/introducing-jsx.html)
- [ESLint Rules](https://eslint.org/docs/rules/)

