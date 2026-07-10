// JSX typings for the WebAwesome custom elements rendered by the gallery.
//
// React 19 renders custom elements fine at runtime, but TSX needs each `<wa-*>`
// tag declared in `JSX.IntrinsicElements` or tsc errors. We keep this minimal:
// one shared props type covering the WA attributes the gallery actually uses,
// applied to every tag. It extends `React.HTMLAttributes` (so `className`,
// `style`, `slot`, `id`, event handlers, etc. stay typed) and adds the WA
// attributes as optional, typed fields — no `any`, typecheck-clean under strict.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

/** Shared attributes for every `<wa-*>` element used in the gallery. */
interface WaAttributes extends HTMLAttributes<HTMLElement> {
  variant?: string;
  appearance?: string;
  size?: string;
  outline?: boolean;
  pill?: boolean;
  disabled?: boolean;
  checked?: boolean;
  open?: boolean;
  active?: boolean;
  loading?: boolean;
  label?: string;
  name?: string;
  value?: string;
  type?: string;
  placeholder?: string;
  content?: string;
  for?: string;
  panel?: string;
  weight?: string;
}

/** Full JSX props (adds `key`/`ref`) for a `<wa-*>` element. */
type WaElementProps = DetailedHTMLProps<WaAttributes, HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "wa-button": WaElementProps;
      "wa-badge": WaElementProps;
      "wa-callout": WaElementProps;
      "wa-card": WaElementProps;
      "wa-checkbox": WaElementProps;
      "wa-details": WaElementProps;
      "wa-dialog": WaElementProps;
      "wa-divider": WaElementProps;
      "wa-icon": WaElementProps;
      "wa-input": WaElementProps;
      "wa-option": WaElementProps;
      "wa-select": WaElementProps;
      "wa-spinner": WaElementProps;
      "wa-switch": WaElementProps;
      "wa-tab": WaElementProps;
      "wa-tab-group": WaElementProps;
      "wa-tab-panel": WaElementProps;
      "wa-tooltip": WaElementProps;
    }
  }
}
