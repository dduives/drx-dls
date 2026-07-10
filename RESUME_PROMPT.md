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
then move it to **Done**. Ask me before any product/design decision not already
covered in the issue. Start with whatever is ready now.

---

## Notes

- **Load MCP first.** MCP servers are read at startup — run `/mcp` after `/clear`
  to confirm the `linear` server is connected. If not, the raw Linear GraphQL API
  with the configured key also works.
- **Project:** https://linear.app/driesdriesdries/project/drx-dls-eba129fb58c2
- **Ready when this was written** (Todo, no blockers): DRI-56, DRI-57, DRI-60,
  DRI-61, DRI-62, DRI-63. Optionally name one, e.g. "start with DRI-57".
- **Done so far:** DRI-49 (studio-scaffold), DRI-50 (studio-state).
- No need to re-paste the plan — it lives in the Linear issues and `CLAUDE.md`.
