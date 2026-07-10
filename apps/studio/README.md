# @drx-dls/studio — Theme Studio

Theme Studio is the visual theme editor for the DRX design system. It's a
browser app that lets you dial in an app's **identity** (palette, typography,
form-control tokens, per-device scale knobs), preview it live against real
[WebAwesome](https://www.webawesome.com/) components, and export a
`drx.theme.json` you can hand to the CLI or drop into an app repo.

It uses the **same `@drx-dls/tokens` generator as the CLI** — imported directly,
no forked copy — so what you see in the preview is exactly what
`drx-theme build` produces.

> **Not published.** This is a private, dev-only tool (`"private": true`). It is
> **not** released to the registry and carries no changeset — only `@drx-dls/tokens`
> and `@drx-dls/webawesome` publish. (If that decision ever changes, drop
> `private` and add a changeset.)

## Run it locally

From the monorepo root:

```bash
npm install
npm run dev --workspace=@drx-dls/studio
```

Then open the printed local URL. Other workspace scripts:

```bash
npm run build     --workspace=@drx-dls/studio   # tsc -b && vite build
npm run typecheck --workspace=@drx-dls/studio
npm run test      --workspace=@drx-dls/studio   # vitest (jsdom)
npm run lint      --workspace=@drx-dls/studio   # oxlint
```

These also run via the root `npm run build|typecheck|test|lint` workspace
fan-out (and in CI).

## What it does

- **Controls** (left panel) — variant color pickers (brand/neutral/success/
  warning/danger), the four global scale knobs (radius / space / font-size /
  border-width), font-family inputs, custom `@font-face` editor, the
  `--wa-form-control-*` group, advisory WCAG contrast warnings, and a
  preview-only light/dark/auto mode toggle.
- **Live preview** (center) — a gallery of real `<wa-*>` components rendered
  inside a `[data-drx-preview]` scope root. On every edit, Studio runs
  `generateTheme` + `emitCss` and injects the resulting scoped `--wa-*`
  properties, so components re-theme instantly. The gallery (and all WebAwesome
  component code) is code-split into a lazy chunk, loaded on first preview.
- **Import / export** (top bar) — round-trip `drx.theme.json`.

## Projects / multi-theme model

Studio manages **multiple named theme projects side-by-side** — e.g. one for
`driesflix`, one for `food.zess.io` — each an independent `Identity` inputs
instance. The top-bar switcher supports create / rename / duplicate / delete /
select. Everything is persisted to `localStorage`:

- The full project list and each project's inputs.
- The **active project id** (you return to the project you were editing).
- The **active platform/device** selection (web/ios/tvos).

First run seeds a single `Default` project from `base.tokens.json`; deleting the
last project re-seeds a fresh `Default`. All state is local to the browser — no
backend.

## Import / export

- **Export** → downloads `<project>.drx.theme.json` — **inputs only** (no
  resolved palette), tagged with the current schema version and matching
  `packages/tokens/drx.theme.example.json`, including per-device `devices`
  overrides. Re-importable and CLI-ready.
- **CSS** → per-device **standalone** drop-in files `<project>.theme.web.css`,
  `.ios.css`, `.tvos.css` via `emitCss(theme, { device })` — each self-contained
  (that device's scales baked into `:root`, no `[data-device]` blocks) for a
  separate per-device app repo.
- **Import** → pick a `drx.theme.json`; it's validated and migrated with the
  shared `importThemeInputs` (same code as the CLI). On failure it shows
  formatted validation errors and **leaves the active project untouched**; on
  success it overwrites the active project's inputs and the editor + preview
  re-seed.

## Platform toggle (Web / iOS / tvOS)

An app shares **one** palette/typography/form-control identity but tunes
different component sizes per device through the four scale knobs. The toggle:

- switches the scale sliders between the global baseline (Web) and the
  `identity.devices[ios|tvos]` multipliers;
- sets `data-device` on the preview root to activate the scoped device
  override blocks;
- swaps the preview chrome per device.

> **Accuracy caveat.** The iOS phone bezel and tvOS 10-foot frame (with its
> simulated focus ring) are **approximate, not pixel-true**. They convey scale
> and device context — they do not emulate native iOS/tvOS rendering. Native
> fidelity is the job of the (planned) SwiftUI `DRXKit`, which consumes the same
> exported tokens. The preview shows a visible "Approximate preview" disclaimer
> for iOS/tvOS.

## Related

- [`@drx-dls/tokens`](../../packages/tokens) — the theme generator/emitters + `drx-theme` CLI (source of truth for the pipeline Studio drives).
- [`@drx-dls/webawesome`](../../packages/webawesome) — the WebAwesome component registration + theming layer the gallery renders.
