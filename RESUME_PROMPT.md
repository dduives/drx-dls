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

**Two candidate milestones are open — confirm order with me first:**
- **M7 · Studio UX & Fixes** (all `Todo`, ready) — bugs/UX found while testing the
  live Studio app. Likely takes priority since it fixes the tool we're actively using.
- **M6 · Component Coverage** (all `Backlog`) — register/theme more WA components
  for driesflix. Promote to `Todo` when picked up.

**M7 suggested order (by impact):** **DRI-91** (live preview not reflecting
scale/color — core bug) → **DRI-93** (dark mode whole page) → **DRI-94** (dark
form-control label contrast) → **DRI-97** (save affordance) → **DRI-95** (font
dropdown) + **DRI-92** (custom-font add button) → **DRI-99** (numbered palette
ramp — research already attached to the issue) → **DRI-96** (form-control
sliders) → **DRI-98** (contrast-warning placement). DRI-99 and DRI-82 each want a
design decision confirmed before building.

**M6 order:** **DRI-81** first (no decision), then **DRI-82** (build-vs-adopt
toast decision needed before code).

---

## Current status (2026-07-10)

- **Done + merged to `main`:** M1 · Tokens Engine ✅, M2 · WebAwesome ✅,
  M3 · Studio Foundation ✅, M4 · Studio Editor ✅, **M5 · Studio Polish ✅**.
  M5 (DRI-64 tests, 67 device-persist, 68 code-splitting, 65 README) + M3's
  DRI-56 (CI/root-script wiring, studio kept out of releases) shipped via
  **PR #1** (merge commit on `main`); the `feat/m5-studio-polish` branch is deleted.
- **Release state:** `changeset status` bumps only `@drx-dls/tokens` +
  `@drx-dls/webawesome` (studio is `private`, guarded by
  `privatePackages: { version:false, tag:false }`). No "Version Packages" PR run yet.

## M7 · Studio UX & Fixes (from hands-on Studio testing 2026-07-10 — all Todo)

- **DRI-91** (High) — live preview must reflect **scale + color** changes on the fly
  (core bug; suspected `:root`-derived tokens not recomputed under the `[data-drx-preview]` scope).
- **DRI-93** (High) — dark mode should darken the **whole page**, not just WA components
  (`ModeToggle` toggles `.wa-dark` on `<html>`; Studio chrome uses hardcoded Tailwind neutrals).
- **DRI-94** (Med) — dark mode: **form-control labels too dark** (low contrast).
- **DRI-97** (Med) — **save affordance / make autosave obvious** (Studio autosaves to
  localStorage; users expected a Save button).
- **DRI-95** (Med) — **font selection via dropdown** with defaults incl. Inter (currently free-text).
- **DRI-92** (Med) — **custom-font editor needs an explicit Add/Save button**.
- **DRI-99** (Med) — **numbered palette ramp** color model (show full `95…05` ramp,
  keep OKLCH, per-step override escape hatch). Industry research + comparison + citations
  are in the issue description + a comment. Confirm per-step-override vs generation-knobs decision.
- **DRI-96** (Low) — **form-control numeric tokens as sliders** (match ScaleControls UX).
- **DRI-98** (Low) — **relocate contrast warnings** to a less intrusive spot (logic unchanged).

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
- **Domain switch:** M5 was `studio-web`; M6 is `webawesome`. This is a clean
  `/clear` boundary — Linear + `CLAUDE.md` rehydrate the context.
- **Project:** https://linear.app/driesdriesdries/project/drx-dls-eba129fb58c2
- No need to re-paste the plan — it lives in the Linear issues and `CLAUDE.md`.
