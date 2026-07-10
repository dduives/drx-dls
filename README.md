# drx-dls

DRX Design System — [WebAwesome](https://webawesome.com)-based, token-themeable, cross-platform.

One component set, many app identities. Define an app's identity as a small set of inputs; the generator derives a full [WebAwesome](https://webawesome.com) `--wa-*` theme from it, so every app gets its own look while reusing the same components — no component code changes. Web via WebAwesome web components (framework-agnostic), native Apple via SwiftUI, same tokens underneath.

## Packages

| Package | What |
|---|---|
| `@drx-dls/tokens` | Derives a WebAwesome `--wa-*` theme (OKLCH palette per variant + scale knobs) from per-app identity inputs. Emitters for CSS / Swift / JSON, and the `drx-theme` CLI |
| `swift/DRXKit` | Native SwiftUI components (iOS + tvOS) on the shared tokens (SwiftPM) — *planned* |

## How theming works

```
base.tokens.json  (structure: variants, tints, scale knobs — source of truth for SHAPE)
        +
drx.theme.json    (per-app identity: variant hues, radius/space/type scales, fonts — SoT for LOOK)
        │  generateTheme(inputs)  → OKLCH derivation
        ├─ theme.css        → sets --wa-color-{variant}-{tint} + --wa-*-scale  → WebAwesome components
        ├─ DRXTheme.swift   → Color + scale constants                          → SwiftUI (iOS / tvOS)
        └─ theme.json       → anything
```

Each variant (`brand`, `neutral`, `success`, `warning`, `danger`) gets an 11-tint palette (`95`≈white … `05`≈black) derived in OKLCH from its base color. WebAwesome's own semantic layer maps those tints to component roles and handles light/dark, so the palette is emitted once. The Device layer (web / iOS / tvOS) drives WebAwesome's global scale knobs (`--wa-border-radius-scale`, `--wa-space-scale`, `--wa-font-size-scale`, `--wa-border-width-scale`).

### Form-control group

`drx.theme.json` can also set a `formControl` group that themes WebAwesome's form fields (inputs, selects, textareas, buttons) via its `--wa-form-control-*` tokens:

```json
{
  "formControl": {
    "paddingBlock": "0.5em",
    "paddingInline": "1em",
    "borderColor": "neutral-70",
    "borderWidth": "1px",
    "borderStyle": "solid",
    "borderRadius": "0.375rem"
  }
}
```

These emit `--wa-form-control-padding-block`, `-padding-inline`, `-border-color`, `-border-width`, `-border-style`, and `-border-radius`. `borderColor` accepts a raw hex or a variant-tint reference like `neutral-70` — the CSS emitter links it to `var(--wa-color-neutral-70)` and the Swift emitter resolves it to the palette hex. All fields have sensible defaults in `base.tokens.json`.

### Per-device scale overrides

One app identity is **shared** across devices — the palette and typography never vary per platform. Only the global scale knobs (component sizes) differ: `base.tokens.json` carries web / iOS / tvOS multipliers (tvOS = 10-foot, iOS = touch), and the effective per-device scale is `identity.<knob> × device.<knob>`.

An app can tune those device multipliers per knob via an optional `devices` block in `drx.theme.json`. It's merged over the base device layer per device, per knob — any omitted knob falls back to the base device value; devices you don't mention are untouched:

```json
{
  "devices": {
    "ios":  { "radiusScale": 1.25, "fontSizeScale": 1.1 },
    "tvos": { "spaceScale": 1.5, "fontSizeScale": 1.7 }
  }
}
```

`resolveIdentity` resolves these into `Identity.devices` (always present), and `generateTheme` returns them as `ResolvedTheme.devices`. `validateThemeInputs` accepts the optional block (valid device keys `web`/`ios`/`tvos`, numeric scale knobs).

**Standalone per-device export.** The default `theme.css` is combined: web scales in `:root` plus `[data-device="ios"]` / `[data-device="tvos"]` blocks. When separate app repos each need their own self-contained file, emit a standalone one per device — the chosen device's resolved scales live directly in `:root` and no `[data-device]` blocks are emitted:

```ts
emitCss(theme);                    // combined (web :root + [data-device] blocks)
emitCss(theme, { device: "ios" }); // standalone — ios scales in :root, no data-device
```

```bash
drx-theme build --target css --device ios  --out ios-app   # → theme.css for the iOS repo
drx-theme build --target css --device tvos --out tvos-app  # → theme.css for the tvOS repo
```

Omitting `--device` keeps the combined output unchanged.

### Custom web fonts

Beyond the `fontFamily` stacks (system fonts), an app can load branded webfonts via an optional `fontFaces` array. Each entry emits one CSS `@font-face` rule (**web only**), placed before the `--wa-font-family-*` declarations; reference the loaded `family` from your `fontFamily` stacks:

```json
{
  "fontFamily": {
    "body": "'Inter', ui-sans-serif, system-ui, sans-serif"
  },
  "fontFaces": [
    { "family": "Inter", "src": "https://rsms.me/inter/font-files/Inter-Regular.woff2?v=4.0", "weight": "400", "style": "normal" },
    { "family": "Inter", "src": "https://rsms.me/inter/font-files/Inter-Bold.woff2?v=4.0", "weight": "700" }
  ]
}
```

`src` may be a bare URL (`.woff2`/`.woff`/`.ttf`/`.otf` — the CSS emitter infers `format(...)` and strips query/hash), a `data:` URL, or a full CSS `src` value (containing `url(`/`local(`) passed through verbatim. `font-display` defaults to `swap`. The Swift and JSON emitters pass the metadata through as-is under `DRXFonts.customFaces` — **native apps must bundle/register these fonts themselves** (Info.plist / bundle resources); the tokens package does not load fonts on Apple platforms.

### Contrast validation (advisory)

Because base colors are arbitrary, the derived ramps can produce illegible text/surface pairings. `checkContrast(resolvedTheme)` from `@drx-dls/tokens` evaluates WCAG 2.1 AA contrast (4.5:1 normal text) for the text-on-fill pairs WebAwesome's **default light-mode** semantic layer actually uses, per variant:

| role | text (`on-*`) | surface (`fill-*`) |
|---|---|---|
| loud | white | tint 50 |
| normal | tint 30 | tint 90 |
| quiet | tint 40 | tint 95 |

It returns a per-variant pass/fail report plus a flat `violations` list. `drx-theme build` prints any violations as **warnings** (never blocking the build), and Theme Studio shows them next to the color pickers. This is **advisory only** — it does not check dark mode, custom palette overrides, or non-text UI contrast (borders, focus rings), and it never enforces or rewrites your colors.

### Schema versioning

The token shape carries a `version` (declared in `base.tokens.json`, currently `2`). A per-app `drx.theme.json` may declare its own `version` so files remain readable as the schema evolves. `@drx-dls/tokens` exposes the contract:

| helper | purpose |
|---|---|
| `CURRENT_SCHEMA_VERSION` | the version this build of the package supports |
| `validateThemeInputs(json)` | non-throwing shape + version check → `{ valid, version, needsMigration, errors }` |
| `migrateThemeInputs(json)` | upgrade an older file to the current version (stamps `version`) |
| `formatValidationIssue(issue)` | one-line `path: message` for display |

Version handling rules:

- **newer** than supported → hard error (the file needs newer tooling — upgrade the package).
- **older** than supported → `needsMigration`; `migrateThemeInputs` runs each registered step in order. Today v1→v2 is a no-op (the shape did not change when versioning was introduced), establishing the pattern for future changes.
- **absent** → assumed current. Pre-versioning files predate this feature and share the current shape, so validation stays lenient and non-breaking.

`drx-theme build` runs this automatically: it validates the loaded inputs (printing each issue and exiting non-zero on failure) and migrates older files before generating the theme. New theme files should declare `"version": 2` (see `drx.theme.example.json`). Theme Studio's import flow will reuse `validateThemeInputs` to reject malformed files with clear messages.

## Use in an app (web)

```bash
npm i @drx-dls/tokens
# plus WebAwesome per its install docs
```

Generate a theme from your identity and load it:

```ts
import "./theme.css";   // generated from your drx.theme.json via `drx-theme build`
```

```html
<html data-device="web">
  <wa-button variant="brand">Themed by drx-dls</wa-button>
</html>
```

Set `data-device="ios"` or `"tvos"` to switch platform sizing. Swapping `theme.css` (a different `drx.theme.json`) re-themes the whole app. Separate iOS / tvOS app repos can instead consume a standalone `theme.css` per device (`drx-theme build --device ios|tvos`) with that device's scales baked into `:root` — no `data-device` attribute needed.

## Develop

```bash
npm install
npm run build        # build every package
npm run typecheck
```

Agents for each area live in `.claude/agents/` (`tokens-engineer`, `webawesome`, `studio-web`, `drxkit-swift`, `monorepo-devops`).
