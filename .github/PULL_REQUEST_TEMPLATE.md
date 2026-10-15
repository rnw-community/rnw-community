## Summary

<!-- What changed and why, in code-intrinsic terms. Link the issue: "Closes #123". -->

## Verification

<!-- Paste the relevant command output or describe the manual check. -->

## Checklist

- [ ] Title follows Conventional Commits (`type(scope): description`, scope is a package name, `deps`, or `deps-dev`), header ≤ 100 characters
- [ ] `pnpm ts && pnpm lint && pnpm test` pass locally
- [ ] Coverage stays at the 99.9% threshold (`pnpm test:coverage` in each touched package)
- [ ] Packaging changes (`exports`, build scripts, dependencies) pass `pnpm build`, `pnpm publint`, `pnpm ts:nodenext`, and `pnpm smoke:esm`
- [ ] Every new or changed public export is documented in the package `readme.md` with a usage example, and the package `AGENTS.md` is updated when layout or patterns change
- [ ] Code follows the conventions in [AGENTS.md](../AGENTS.md): one exported entity per file, no code comments beyond the sanctioned TSDoc and pragmas, `@rnw-community/shared` primitives over inline helpers
- [ ] No AI-tool or review-bot names in code, tests, docs, commit messages, or this description
- [ ] Every review thread is answered with a fixing commit or a concrete refutation before merge
