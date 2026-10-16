# `public-api-tsdoc` Rule Documentation

## Overview

`public-api-tsdoc` enforces the scoped TSDoc policy: every declaration reachable from a package entry point carries a
one-sentence TSDoc block with `@see` links, and TSDoc appears nowhere else. Consumers' IDEs and AI agents read the
published `.d.ts`, so the summary plus a link to the canonical docs is the one documentation surface that reaches them.

The rule needs type information (`parserOptions.projectService` or `parserOptions.project`).

## What counts as public

The rule resolves the nearest `package.json` of the linted file. Its entry points are `src/index.ts(x)` plus every
`dist/**/*.d.ts` target in `types` / `exports`, mapped back to the matching `src` file. A package with `"private": true`
has no public API.

| Declaration                                                                          | TSDoc                                                       |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Exported from an entry point (incl. each overload signature)                         | Required: one sentence + at least one `@see`, no other tags |
| Public method or accessor of an exported class                                       | Required, same shape                                        |
| Platform variant (`x.web.ts`, `x.native.ts`, …) of an exported declaration in `x.ts` | Required, same shape                                        |
| Member of an exported interface, type, enum, or class field                          | Optional; `@defaultValue` and `@see` allowed                |
| Declaration only referenced by the public API's types                                | Optional; `@defaultValue` and `@see` allowed                |
| Overload implementation, setter paired with a getter                                 | Not required                                                |
| Everything else                                                                      | Forbidden                                                   |

## Examples

### Valid

```ts
/**
 * Type guard narrowing a value to non-nullable by excluding both `undefined` and `null`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-defined/is-defined.md
 */
export const isDefined = <T>(value: T | null | undefined): value is T => value !== undefined && value !== null;
```

### Invalid

```ts
export const isDefined = <T>(value: T | null | undefined): value is T => value !== undefined && value !== null;

/** Builds the lookup key. */
const buildKey = (id: string): string => `key:${id}`;
```

The first declaration is public but undocumented (`missingTsDoc`); the second is internal but documented
(`tsDocOutsidePublicApi`).
