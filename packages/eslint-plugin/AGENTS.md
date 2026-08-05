# @rnw-community/eslint-plugin

Custom ESLint plugin with JSX code-quality rules. Currently ships exactly one rule: `no-complex-jsx-logic`.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  index.ts       — plugin object (meta, configs.recommended, configs['flat/recommended'], rules); `export = plugin`
  rules/
    index.ts     — rules = { 'no-complex-jsx-logic': noComplexJsxLogicRule } satisfies Record<string, TSESLint.RuleModule<...>>
    no-complex-jsx-logic/
      no-complex-jsx-logic.rule.ts   — the AST visitor, built with ESLintUtils.RuleCreator
      no-complex-jsx-logic.spec.ts   — @typescript-eslint/rule-tester RuleTester valid/invalid cases
      no-complex-jsx-logic.md        — human-facing rule documentation (overview, rationale, valid/invalid examples)
```

### Key Patterns

- `src/index.ts` ends with `export = plugin` — required CommonJS interop shape for an ESLint plugin object; this is
  the reason `verbatimModuleSyntax` is disabled for this package (see TypeScript Config below)
- The plugin's `namespace` is derived at runtime from `pkg.name.split('/')[0]` (falls back to the literal
  `'@rnw-community'` string if that split ever comes back empty), then used to key both config presets:
  `configs.recommended` (legacy eslintrc array, `parserOptions.ecmaFeatures.jsx: true`) and
  `configs['flat/recommended']` (flat-config array, `languageOptions.parserOptions.ecmaFeatures.jsx: true` and a
  `plugins: { [namespace]: plugin }` self-reference) — both presets exist in source and both enable
  `${namespace}/no-complex-jsx-logic` as `'error'`
- `noComplexJsxLogicRule`'s visitor only fires on `JSXExpressionContainer` nodes whose `parent.type` is
  `JSXAttribute` — i.e. it inspects prop values only; JSX children expressions are never visited
- Exactly six message IDs, each tied to one AST shape inside a JSX prop: `ArrowFunctionExpression` →
  `noInlineCallbacks`; `BinaryExpression` whose operator is not `===`/`!==` → `noPropsCalculations`;
  `ConditionalExpression` → `noPropsTernary`; `LogicalExpression` whose operator is not `??` → `noPropsTernary`;
  `ObjectExpression` → `noPropsInlineObjects`; `ArrayExpression` → `noPropsInlineArrays`. A `CallExpression` prop is
  otherwise allowed, but is walked one level into its `arguments`, and any argument that is itself a
  `ConditionalExpression` reports `noTernaryCallbackArguments`
- Tests use `@typescript-eslint/rule-tester`'s `RuleTester` (flat-config-shaped constructor: `languageOptions.parserOptions`)

### TypeScript Config

- `tsconfig.json` and both build configs (`tsconfig.build-esm.json`, `tsconfig.build-cjs.json`) override the root with
  `moduleResolution`/`module` set to `nodenext`/`NodeNext`/`node16` variants and `verbatimModuleSyntax: false` —
  the latter is required because `export = plugin` cannot coexist with `verbatimModuleSyntax: true`

### Publication shape — CommonJS only, no `"module"` field

Unlike every other package in the repo, this one does not ship a genuine ESM build: `export = plugin` cannot be
re-emitted as ESM syntax, so `tsc` compiles both `dist/esm/` and `dist/cjs/` as CommonJS (see root AGENTS.md's ESM
Modernization Status for the full reasoning). `package.json` reflects this with root-level `"type": "commonjs"`
(covering both dist trees) and no `"module"` field. `yarn publint`'s `attw` check for this package alone passes
`--ignore-rules named-exports`, since `attw`'s named-export warning only flags the unsupported (and undocumented)
`import { x } from '@rnw-community/eslint-plugin'` form — the readme's documented usage is a default import. The
`build` script also deletes `dist/esm/package.json` / `dist/cjs/package.json` after compiling: `tsc`'s
`resolveJsonModule` copies the `../package.json` import target into both output trees verbatim (self-referential
`"exports"` field and all), which `publint` correctly flags as dead weight.

### Dependencies

- `@typescript-eslint/utils` — `ESLintUtils.RuleCreator` and `TSESLint`/`AST_NODE_TYPES` used by the rule
- `@typescript-eslint/rule-tester` — `RuleTester` used in the spec (listed as a production dependency, not a
  devDependency, in this package's package.json)
- Peers: `eslint` (^9), `typescript-eslint` (^8)

### Coverage

This package overrides the monorepo default in its own `jest.config.js`:
statements **94.4%**, branches **88.8%**, functions **99.9%**, lines **94.1%**.
