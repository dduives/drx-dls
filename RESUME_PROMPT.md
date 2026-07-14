# Resume prompt — drx-dls (Linear-driven)

Paste this after `/clear` (or `/restart`) to pick the project back up.

First run `/mcp` to confirm the `linear` server is connected. Then:

---

Work on the **drx-dls** project using **Linear** as the source of truth (see the
"Task tracking (Linear)" section in `CLAUDE.md`). The Linear project is `drx-dls`,
team `DRI`. Connect via the Linear MCP server (`/mcp`) or the API key in
`~/.copilot/mcp-config.json`.

Find the next actionable issue = a **Todo** issue with **no open blocking issues**
(dependencies are modeled as blocks/blocked-by relations). Work through them one at
a time: move the issue to **In Progress** before starting, implement exactly per the
issue description (each starts with a `Key:` slug), validate (typecheck/build/tests),
then move it to **Done** and post an end-report comment. Ask me before any
product/design decision not already covered in the issue.

**Next up: M6 · Component Coverage** (all `Backlog` — promote to `Todo` when picked
up). M7 · Studio UX & Fixes is **done** (see status below). Confirm with me before
starting if priorities may have shifted.

**M6 order:** **DRI-81** first (no decision), then **DRI-82** (build-vs-adopt
toast decision needed before code).

---

## Current status (2026-07-14)

- **Done + merged to `main`:** M1 · Tokens Engine ✅, M2 · WebAwesome ✅,
  M3 · Studio Foundation ✅, M4 · Studio Editor ✅, M5 · Studio Polish ✅ (PR #1).
- **M7 · Studio UX & Fixes ✅ DONE** — all 9 issues complete on branch
  `feat/m7-studio-ux-fixes`, open in **PR #2** (awaiting review/merge to `main`):
  - DRI-91 (live preview reflects scale+color), DRI-93 (dark-mode surface),
    DRI-94 (dark form-control label contrast) — the live-preview fixes.
  - DRI-99 (numbered palette ramp) + DRI-100 (per-component bg overrides).
  - DRI-92 (explicit Add-font button), DRI-95 (font-family dropdown),
    DRI-97 (autosave indicator), DRI-96 (form-control sliders),
    DRI-98 (collapsible contrast-warning badge).
  - Validated repo-wide: typecheck ✅ · build ✅ · tests ✅ (studio 43/43 + tokens) ·
    oxlint ✅. Each issue has a Done end-report comment. No changesets (studio private).
  - **Action on resume:** review + merge PR #2 (merge commit, then delete branch)
    before starting M6.
- **Release state:** `changeset status` bumps only `@drx-dls/tokens` +
  `@drx-dls/webawesome` (studio is `private`). No "Version Packages" PR run yet.
- **Flagged follow-up** (`agent:tokens-engineer`): `formControl.borderColor` default
  is pinned to `neutral-70` and doesn't invert for dark mode — not yet ticketed.

## M7 · Studio UX & Fixes — ✅ COMPLETE (branch `feat/m7-studio-ux-fixes`, PR #2)

All issues Done. Kept here for reference; nothing to pick up.

## M6 · Component Coverage (next — all Backlog, source: driesflix gap analysis DRI-70)

- **DRI-81** (`agent:webawesome`, **High**) — register + theme additional WebAwesome
  components driesflix needs (they already exist in WA 3.10; this is
  registration + theming, not building). Must-have: `avatar`, `progress-bar`,
  `progress-ring`, `slider`, `skeleton`, `dropdown`(+`dropdown-item`),
  `popover`/`popup`, `textarea`, `radio`(+`radio-group`). Triage likely-needed:
  `drawer`, `tag`, `scroller`/`carousel`(+item), `breadcrumb`(+item),
  `format-date`/`format-number`/`relative-time`. Work = side-effect imports +
  `register*` stubs in `packages/webawesome/src/register.ts`, export from
  `index.ts`, verify each themes purely via `--wa-*`, add to the Studio gallery
  (`apps/studio/src/components/gallery/Gallery.tsx`). `registerAll()` should
  include the must-have set. No product decision required — good subagent delegate.
- **DRI-82** (`agent:webawesome`, **Medium**) — toast/notification: the one real
  gap with no WA primitive (driesflix uses `sonner` in 4 places). **Needs a
  build-vs-adopt decision from me first** (issue recommends Option 1: build a
  framework-agnostic `drx-toast` on `wa-callout` styling, `--wa-*`-themed). Do NOT
  start building until the decision is recorded.

## Backlog (no milestone, not scheduled for v1)

- **DRI-59** (`agent:tokens-engineer`) — broaden token surface (shadows/elevation,
  focus rings, richer typography scale). Revisit once driesflix/food.zess.io need it.
- **DRI-47** — DLS token architecture (variable collections & layering) — planning.
- **DRI-48** — plan: disconnect from Filament DLS — planning.

## Git / branch cadence (see CLAUDE.md "Git / branch cadence")

- **Branch per milestone.** Whichever milestone we do next (M7 or M6), create its
  branch off `main` after `/clear`, e.g.
  `git checkout main && git pull && git checkout -b feat/m7-studio-ux-fixes`
  (or `feat/m6-component-coverage`).
- **Push + open a PR → merge to `main` at milestone completion** (once validated).
  Don't push mid-milestone WIP unless asked. `main` is the integration/release branch.
- One conventional commit per issue with the `Co-authored-by: Copilot` trailer.
- Merge PRs with a **merge commit** (preserve per-issue history), then delete the branch.

## Notes

- **Load MCP first.** MCP servers are read at startup — run `/mcp` after `/clear`
  to confirm the `linear` server is connected. If not, the raw Linear GraphQL API
  with the configured key also works.
- **Domain switch:** M7 was `studio-web`; M6 is `webawesome`. This is a clean
  `/clear` boundary — Linear + `CLAUDE.md` rehydrate the context.
- **Project:** https://linear.app/driesdriesdries/project/drx-dls-eba129fb58c2
- No need to re-paste the plan — it lives in the Linear issues and `CLAUDE.md`.
