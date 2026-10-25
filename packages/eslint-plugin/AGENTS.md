# @rnw-community/eslint-plugin

Custom ESLint plugin. Ships two rules: `no-complex-jsx-logic` (JSX code quality, in the `recommended` configs) and
`public-api-tsdoc` (type-aware scoped-TSDoc enforcement, opt-in only).

## Package Commands

```bash
pnpm test && pnpm test:coverage && pnpm build && pnpm ts && pnpm lint:fix
```

## Architecture

```text
src/
  index.ts       — plugin object (meta, configs.recommended, configs['flat/recommended'], rules); `export = plugin`
  rules/
    index.ts     — rules = { 'no-complex-jsx-logic', 'public-api-tsdoc' } satisfies Record<string, TSESLint.RuleModule<...>>
    no-complex-jsx-logic/
      no-complex-jsx-logic.rule.ts   — the AST visitor, built with ESLintUtils.RuleCreator
      no-complex-jsx-logic.spec.ts   — @typescript-eslint/rule-tester RuleTester valid/invalid cases
      no-complex-jsx-logic.md        — human-facing rule documentation (overview, rationale, valid/invalid examples)
    public-api-tsdoc/
      public-api-tsdoc.rule.ts       — visitor classifying each declaration as exported / referenced / internal
      collect-public-api.ts          — walks the TS program from the entry points; cached per program + package dir
      resolve-entry-files.ts         — src/index.ts(x) plus package.json `types`/`exports` .d.ts targets mapped to src
      find-package.ts                — nearest package.json lookup, cached per directory
      get-tsdoc-comment.ts           — the `/** */` block attached to a node (skips eslint pragmas, handles decorators)
      get-tsdoc-tags.ts / is-tsdoc-comment.ts / *.interface.ts — small helpers and shapes
      public-api-tsdoc.spec.ts       — typed RuleTester cases against fixture packages written to the OS temp dir
      public-api-tsdoc.md            — rule documentation (what counts as public, allowed tags)
```

- `public-api-tsdoc` needs `parserServices.program` (typed linting). It classifies declarations as **exported**
  (reachable from an entry point: TSDoc required, `@see` required, no other tags), **referenced** (only reachable through
  the types of exported declarations: TSDoc optional) or **internal** (TSDoc forbidden). Members of exported/referenced
  interfaces, types, enums, and public class fields may carry TSDoc with `@defaultValue`/`@see`. Platform variants
  (`x.web.ts`, …) inherit the exported status of the same-named declaration in `x.ts`

### Key Patterns

- `src/index.ts` ends with `export = plugin` — required CommonJS interop shape for an ESLint plugin object; this is
  the reason `verbatimModuleSyntax` is disabled for this package (see TypeScript Config below)
- `src/index.ts` defines `namespace` as `'@rnw-community'` and `meta.name` as `${namespace}/eslint-plugin`;
  `namespace` keys both config presets:
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
re-emitted as ESM syntax, so `tsrs` compiles both `dist/esm/` and `dist/cjs/` as CommonJS (see root AGENTS.md's ESM
Modernization Status for the full reasoning). `package.json` reflects this with root-level `"type": "commonjs"`
(covering both dist trees) and no `"module"` field. `pnpm publint`'s `attw` check for this package alone passes
`--ignore-rules named-exports`, since `attw`'s named-export warning only flags the unsupported (and undocumented)
`import { x } from '@rnw-community/eslint-plugin'` form — the readme's documented usage is a default import. The plugin's
`meta.name` and namespace are constants rather than a `../package.json` import, so nothing outside `src` lands in
`dist` and the published entry stays loadable.

### Dependencies

- `@typescript-eslint/utils` — `ESLintUtils.RuleCreator` and `TSESLint`/`AST_NODE_TYPES` used by the rule
- `@typescript-eslint/rule-tester` — `RuleTester` used in the spec (listed as a production dependency, not a
  devDependency, in this package's package.json)
- Peers: `eslint` (^9 || ^10), `typescript` (>=5.2.0, used by `public-api-tsdoc` for symbol resolution)

### Coverage

Uses the monorepo default from `get-jest.config.js`: 99.9% statements, branches, functions, and lines.
