import { useEffect } from "react";
import type { Identity } from "@drx-dls/tokens";
import { buildScopedThemeCss, PREVIEW_STYLE_ID } from "../lib/scopedTheme.ts";

/**
 * Live-preview pipeline (DRI-52). On every `identity` change (which includes
 * project switches — DRI-58 re-seeds `identity`), regenerate the theme CSS
 * scoped to the preview pane and inject it into a single managed `<style>`
 * element. Regeneration is cheap, so we key straight off `identity` with no
 * debounce. The style element is scoped via selector, so it never touches
 * Studio's own chrome; it is removed on unmount.
 */
export function usePreviewTheme(identity: Identity): void {
  useEffect(() => {
    let style = document.getElementById(
      PREVIEW_STYLE_ID,
    ) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = PREVIEW_STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = buildScopedThemeCss(identity);

    return () => {
      document.getElementById(PREVIEW_STYLE_ID)?.remove();
    };
  }, [identity]);
}
