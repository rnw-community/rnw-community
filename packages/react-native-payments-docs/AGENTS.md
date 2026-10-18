# @rnw-community/react-native-payments-docs

Private. VitePress site for `@rnw-community/react-native-payments`, deployed to GitHub Pages by
`.github/workflows/docs.yml`. It holds no content: `srcDir` points at `../react-native-payments`, so the site renders
that package's `readme.md` (as the landing page) and `docs/**` verbatim — the same files that ship in the npm tarball.

## Commands

```bash
pnpm docs:dev       # local dev server
pnpm docs:build     # production build into .vitepress/dist; fails on any dead relative link
pnpm docs:preview   # serve the production build
```

## How the config bridges GitHub markdown and the site

- Sidebar is generated from the `docs/` tree: one group per sub-directory (ordered by `sectionOrder`, unknown
  directories last), page titles taken from each file's H1, top-level `docs/*.md` files appended at the end
- Relative links are resolved against the real source file: links to site pages stay relative, links to
  `readme.md` point at the landing page, links to anything else in the repo (`src/`, `AGENTS.md`, `llms.txt`, other
  packages) become `github.com/.../blob/master/...` URLs, and a link to a missing file fails the build
- Inline code is rendered with `v-pre`, so `${{ ... }}` snippets are not evaluated as Vue interpolation
- `vue` imports are resolved from VitePress's own dependency tree, because the markdown sources live outside this
  package and pnpm does not expose `vue` to `packages/react-native-payments`

## Deployment

Pull requests touching the payments package or this one build the site (dead-link gate). Pushes to `master` upload the
build and deploy it with `actions/deploy-pages`; the deploy step is skipped with a warning until the repository's
Pages source is set to "GitHub Actions".
