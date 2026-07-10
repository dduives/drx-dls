# @drx-dls/webawesome

WebAwesome integration for the DRX design system. Registers [WebAwesome](https://www.webawesome.com/) web components and themes them via `@drx-dls/tokens`.

## What this package does

- **Registers** common WebAwesome Free components (button, input, card, dialog, etc.)
- **Swaps** the default icon library to [Phosphor Icons](https://phosphoricons.com) (MIT, no paywall)
- **Injects** a DRX-generated `theme.css` at runtime
- **Toggles** light/dark mode via a simple API

WebAwesome components are styled entirely through `--wa-*` CSS custom properties. The `@drx-dls/tokens` package generates these properties from a theme config, so swapping `theme.css` = new brand identity with zero component changes.

## Install

```bash
npm install @drx-dls/webawesome
```

> Peer: `@awesome.me/webawesome` (^3.10.0) and `@drx-dls/tokens` (workspace).

## Usage

### 1. Register components

```ts
// Register all bundled components (side-effect imports)
import { registerAll } from "@drx-dls/webawesome/register";
registerAll();

// Or cherry-pick
import { registerButton, registerInput } from "@drx-dls/webawesome/register";
registerButton();
registerInput();
```

### 2. Apply a theme

```ts
import { applyTheme } from "@drx-dls/webawesome/theme";

// From a URL
applyTheme("/assets/theme.css");

// Or inline CSS (e.g. from a bundler ?raw import)
import themeCSS from "./theme.css?raw";
applyTheme(themeCSS);
```

### 3. Dark mode

```ts
import { setColorScheme, getColorScheme } from "@drx-dls/webawesome/theme";

setColorScheme("dark");   // Force dark
setColorScheme("light");  // Force light
setColorScheme("auto");   // Follow prefers-color-scheme

getColorScheme();          // → "light" | "dark" | "auto"
```

## Icons — Phosphor, not Font Awesome

WebAwesome ships with **Font Awesome** as its `default` icon library, but the
interesting families (Chisel, Etch, Duotone, Sharp, …) are **paywalled** — only
the ~2000 Free icons resolve without a paid kit token. We replace the `default`
(and internal `system`) libraries with **[Phosphor Icons](https://phosphoricons.com)**
(MIT, 1200+ glyphs, 6 weights) so every `<wa-icon>` renders a fully-open icon set
— no kit, no token, no webfont.

`registerAll()` does this automatically. If you cherry-pick, call it yourself
**before the first `<wa-icon>` renders**:

```ts
import { registerPhosphorIcons } from "@drx-dls/webawesome";
registerPhosphorIcons();
```

Icons are fetched from jsDelivr (pinned via `PHOSPHOR_VERSION`), so there is
nothing to bundle or self-host.

### Picking icons & weights

Use any [Phosphor icon name](https://phosphoricons.com) directly. The weight is
chosen with the `variant` attribute:

```html
<wa-icon name="heart"></wa-icon>                 <!-- regular (default) -->
<wa-icon name="heart" variant="thin"></wa-icon>
<wa-icon name="heart" variant="light"></wa-icon>
<wa-icon name="heart" variant="bold"></wa-icon>
<wa-icon name="heart" variant="fill"></wa-icon>
<wa-icon name="heart" variant="duotone"></wa-icon>
```

Weight mapping: WebAwesome's classic variants map to Phosphor as
`thin→thin`, `light→light`, `regular→regular`, and `solid→regular` (Phosphor's
canonical weight). `bold`, `fill`, and `duotone` are Phosphor-only weights
addressable directly.

### ⚠️ Migration note (Font Awesome → Phosphor)

Icon **names differ** from Font Awesome. Audit existing `<wa-icon name="…">`
usages and rename to the Phosphor equivalent (e.g. FA `xmark` → Phosphor `x`,
FA `magnifying-glass` → Phosphor `magnifying-glass`, FA `gear` → Phosphor
`gear`). WebAwesome's internal component icons (select carets, dialog close,
checkbox check, media controls) are remapped automatically.

## Generating a theme

Use the `drx-theme` CLI from `@drx-dls/tokens`:

```bash
npx drx-theme build --input my-theme.json --output theme.css
```

See [`@drx-dls/tokens` README](../tokens/README.md) for theme config format and available options.

## Demo

Open `demo/index.html` in a browser (after `npm run build` and generating a `demo/theme.css`).

## License

MIT
