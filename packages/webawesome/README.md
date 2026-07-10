# @drx-dls/webawesome

WebAwesome integration for the DRX design system. Registers [WebAwesome](https://www.webawesome.com/) web components and themes them via `@drx-dls/tokens`.

## What this package does

- **Registers** common WebAwesome Free components (button, input, card, dialog, etc.)
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
