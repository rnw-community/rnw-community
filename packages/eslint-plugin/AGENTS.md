# @rnw-community/eslint-plugin

Custom ESLint plugin with JSX code quality rules. Currently ships one rule: `no-complex-jsx-logic`.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  index.ts       — Plugin definition (export = plugin, CommonJS interop for ESLint)
  rules/
    index.ts     — Aggregates all rules
    no-complex-jsx-logic/
      no-complex-jsx-logic.rule.ts   — AST visitor (JSXExpressionContainer in JSXAttribute context)
      no-complex-jsx-logic.spec.ts   — RuleTester valid/invalid cases
      no-complex-jsx-logic.md        — Rule documentation
```

### Key Patterns

- Uses `export = plugin` (CommonJS interop required by ESLint)
- Ships both legacy (`recommended`) and flat config (`flat/recommended`) presets
- Namespace derived from package.json name: `@rnw-community`
- Rule only acts on `JSXAttribute` context (prop values) — JSX children are unaffected
- Banned in JSX props: arrow functions, ternary, `&&`/`||` (not `??`), binary ops (not `===`/`!==`), inline objects/arrays
- Tests use `@typescript-eslint/rule-tester`'s `RuleTester`

### TypeScript Config

- Uses `moduleResolution: "nodenext"`, `module: "nodenext"` (overrides root)
- `verbatimModuleSyntax: false` in tsconfig.json and both build configs (incompatible with `export =`)

### Dependencies

`@typescript-eslint/utils`, `@typescript-eslint/rule-tester`. Peers: `eslint ^9`, `typescript-eslint ^8`.

### Coverage

Custom thresholds: statements **94.4%**, branches **88.8%**, functions **99.9%**, lines **94.1%**.
