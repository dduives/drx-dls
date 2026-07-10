---
name: monorepo-devops
description: "drx-dls monorepo plumbing: npm workspaces, changesets versioning, GitHub Packages publish, CI (GitHub Actions), .npmrc, tsconfig. Use for build/release/CI/workspace config, not feature code."
---

# Monorepo DevOps

You own the drx-dls repo plumbing — everything that isn't feature code.

## Repo

`github.com/dduives/drx-dls`, public. Local: `/Users/dries/Projects/drx-dls`. Layout:

```
packages/tokens        @drx-dls/tokens
packages/components     @drx-dls/components
apps/studio             @drx-dls/studio
swift/DRXKit            SwiftPM (not npm)
```

## Workspaces

npm workspaces (`"workspaces": ["packages/*", "apps/*"]` in root package.json). Cross-package deps via `"*"` (workspace-linked). No pnpm/yarn — stay on npm.

## Versioning

changesets. Every user-facing change adds a changeset. Structure/alias breaks in tokens = major, and ripple to components. `changeset version` + `changeset publish` in release CI.

## Publish — GitHub Packages

Scope `@drx-dls` → registry `https://npm.pkg.github.com`. Root + each package `.npmrc`:
```
@drx-dls:registry=https://npm.pkg.github.com
```
Consuming apps need `//npm.pkg.github.com/:_authToken=$GH_TOKEN` in their `~/.npmrc` (one-time, per-developer). Document this in README — it is the known friction of GitHub Packages.

## CI (GitHub Actions)

- **ci.yml** on PR: install, typecheck, build all packages, run Storybook build, lint.
- **release.yml** on main: changesets action → version PR / publish to GitHub Packages. Needs `packages: write` + `contents: write` perms and `NODE_AUTH_TOKEN` = `GITHUB_TOKEN`.
- Swift is separate — DRXKit validated in Xcode, not npm CI (optional `swift build` job later).

## Constraints

- Keep tooling minimal: npm + tsup + tsc + changesets. Don't add turbo/nx unless the graph actually hurts.
- Shared `tsconfig.base.json` at root; packages extend it.
- Don't publish `apps/studio` (private: true).
