# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript monorepo with 18 packages providing NestJS, React, React Native, and React Native Web utilities. Uses Yarn Workspaces (v4), Turbo for task orchestration, and Lerna for publishing.

## Common Commands

```bash
# Root-level (runs across all packages via Turbo)
yarn build              # Build all packages (dual ESM + CJS output to dist/)
yarn ts                 # Type check all packages
yarn lint               # ESLint all packages
yarn lint:fix           # Auto-fix lint issues
yarn test               # Run all tests
yarn test:coverage      # Run tests with coverage
yarn format             # Prettier format all
yarn cpd                # Copy-paste detection
yarn deadcode           # Find unused code (knip)

# Single package (cd into package first)
cd packages/shared
yarn test               # Run tests for this package only
yarn test --watch       # Watch mode
yarn test:coverage      # Tests with coverage
yarn build              # Build this package only
yarn ts                 # Type check this package only
yarn lint:fix           # Fix lint issues in this package
```

## Architecture

### Package Categories

- **shared** — Core utility hub (type guards, helpers, types); many packages depend on it
- **nestjs-\*** — NestJS modules (enterprise decorators, rxjs-logger, rxjs-metrics, rxjs-lock, rxjs-redis, typed-config, webpack-swc)
- **rxjs-errors** — RxJS error utilities
- **react-native-payments** — Payment Request API for Apple Pay/Google Pay (with 3 example packages)
- **platform, fast-style, redux-loadable** — React Native/Web utilities
- **object-field-tree** — Object field combination trees
- **wdio** — WebDriverIO page objects and commands
- **eslint-plugin** — Custom ESLint plugin

### Build Output

All packages publish dual format via `exports` field:
- `dist/esm/` — ES Modules (ES2021)
- `dist/cjs/` — CommonJS (ES2021)
- Type declarations at `dist/esm/index.d.ts`

## Code Style & Conventions

### File Organization
- One exported entity per file (one type, one function, one constant, etc.)
- Each file lives in its own directory named after the entity (e.g., `type/maybe-type/maybe.type.ts`)

### TypeScript — Strict mode with all strict flags enabled, decorators enabled

### Formatting (Prettier)
- Single quotes, 125 char width, 4-space indent, semicolons required, trailing commas ES5, no parens on single arrow params

### Import Order (enforced by ESLint)
Groups: builtin → external → `@rnw-community/*` → parent → sibling → index → type, alphabetized, newlines between groups

### ESLint Key Rules
- Max function lines: 85 (blank lines/comments excluded)
- Max statements per function: 12
- Max params: 4 (`@typescript-eslint/max-params`)
- Complexity limit: 25
- Enum members: UPPER_CASE or PascalCase
- Class member ordering: fields → constructor → getters → setters → methods (public → protected → private)
- JSX only in `.tsx` files, max depth 4
- Unused vars with `_` prefix are allowed (`argsIgnorePattern: ^_`)
- `expect.hasAssertions()` in every test case

### Commit Messages (Conventional Commits, enforced by commitlint + husky)
Format: `type(scope): description` — scope must be a package name (e.g., `shared`, `react-native-payments`)

### Testing
- Jest 29, test files colocated: `src/**/*.spec.ts`
- Imports from `@jest/globals` (not global Jest)
- **Coverage threshold: 99.9%** for statements, branches, functions, and lines
- Mock files (`*.mock.ts`) excluded from coverage

## Planning Convention

Always write plans to `.plans/` as `.md` files before executing multi-step changes. Plans are gitignored and serve as working documents for complex tasks.

## ESM Modernization Status

The monorepo uses dual ESM + CJS output. Key decisions:
- `sideEffects: false` (boolean) in all package.json files
- `"types"` condition is **first** in all `exports` entries (required for `moduleResolution: "nodenext"` consumers)
- `moduleResolution: "bundler"` in root tsconfig, `"node"` override in CJS build tsconfig
- `verbatimModuleSyntax: true` enforces explicit `import type` for type-only imports
- `lib: ["es2021"]` matches the build target
- Build scripts correctly reference their tsconfig files (`build:esm` → `tsconfig.build-esm.json`)

## Pre-commit Checks

**IMPORTANT: Always run all checks before committing and pushing:**
```bash
yarn ts && yarn lint && yarn test
```
All three must pass before creating a commit. Do not skip any of these checks.

## Pre-commit Hooks (Husky + lint-staged)
- Auto-runs ESLint fix and Prettier on staged `.ts/.tsx` files
- Sorts `package.json` files
- Validates commit message format
