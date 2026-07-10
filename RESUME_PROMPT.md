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

**Next up: finish M5 · Studio Polish.** Suggested order: **DRI-64** (tests — lock in
behavior first), then **DRI-67** + **DRI-68** (fold their small tests into the suite),
then **DRI-65** (README last, so it documents the final state). **DRI-56** (M3 CI/root
scripts/changesets) is also still open and pairs naturally with DRI-64's `test` script.

---

## Current status (2026-07-10)

- **Done:** M1 · Tokens Engine ✅, M2 · WebAwesome ✅, M4 · Studio Editor ✅
  (DRI-58, 52, 51, 53, 55, 54 + enabling DRI-66). M1–M4 are pushed to `origin/main`.
- **M3 · Studio Foundation** (75%): DRI-49 ✅, 50 ✅, 58 ✅ — **DRI-56 still Todo** (CI/root scripts/changesets).
- **M5 · Studio Polish** (0%, all Todo, ready): **DRI-64** (studio-tests, broadened),
  **DRI-65** (studio-readme), **DRI-67** (persist device selection), **DRI-68** (code-splitting).
- **Backlog (no milestone):** DRI-59 (broaden token surface).

## Git / branch cadence (see CLAUDE.md "Git / branch cadence")

- **Branch per milestone.** M5 work goes on **`feat/m5-studio-polish`** (already created;
  currently has the CLAUDE.md/RESUME_PROMPT convention commits, not yet pushed).
  `git checkout feat/m5-studio-polish` after `/clear`.
- **Push + open a PR → merge to `main` at milestone completion** (once validated). Don't
  push mid-milestone WIP unless asked. `main` is the integration/release branch.
- One conventional commit per issue with the `Co-authored-by: Copilot` trailer.

## Notes

- **Load MCP first.** MCP servers are read at startup — run `/mcp` after `/clear`
  to confirm the `linear` server is connected. If not, the raw Linear GraphQL API
  with the configured key also works.
- **Project:** https://linear.app/driesdriesdries/project/drx-dls-eba129fb58c2
- No need to re-paste the plan — it lives in the Linear issues and `CLAUDE.md`.
