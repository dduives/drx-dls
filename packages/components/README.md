# @drx-dls/components

Web component library for the DRX design system — [Radix Primitives](https://www.radix-ui.com/primitives) + [CVA](https://cva.style), themed entirely through `@drx-dls/tokens`. No hardcoded colors: every component styles with token-backed Tailwind utilities, so swapping the loaded `theme.css` re-themes the whole set.

## Install

```bash
npm i @drx-dls/components @drx-dls/tokens
```

## Set up Tailwind in the consuming app

```js
// tailwind.config.cjs
module.exports = {
  presets: [require("@drx-dls/components/tailwind-preset")],
  content: [
    "./src/**/*.{ts,tsx}",
    "./node_modules/@drx-dls/components/dist/**/*.js",
  ],
};
```

Then load a theme (generated from your `drx.theme.json` via `drx-theme build`) and the base styles:

```ts
import "./theme.css";                 // your app identity
import "@drx-dls/components/styles.css";
import { Button } from "@drx-dls/components";
```

## Theming knobs

Set `data-mode` (`light` | `dark`) and `data-device` (`web` | `ios` | `tvos`) on a root element to switch appearance and platform sizing — both are pure token overrides.

## Components (v1)

Button · Badge · Card · Input · Switch · Dialog · Tabs · Tooltip.

## Develop

```bash
npm run build        # tsup (ESM + d.ts) + tailwind styles.css
npm run storybook    # component explorer with mode/device toolbar
```
