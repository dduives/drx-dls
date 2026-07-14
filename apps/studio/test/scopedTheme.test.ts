import { describe, expect, it } from "vitest";
import { emitCss, generateTheme, resolveIdentity } from "@drx-dls/tokens";
import {
  buildScopedThemeCss,
  scopeThemeCss,
  PREVIEW_SCOPE_SELECTOR,
} from "../src/lib/scopedTheme.ts";

const SCOPE = PREVIEW_SCOPE_SELECTOR; // "[data-drx-preview]"

// A theme with a custom @font-face so we can assert it stays at the top level.
function themeCss() {
  return emitCss(
    generateTheme(
      resolveIdentity({
        fontFaces: [{ family: "Inter", src: "https://x/Inter.woff2" }],
      }),
    ),
  );
}

describe("scopeThemeCss", () => {
  it("rewrites the top-level :root block to the scope selector", () => {
    const scoped = scopeThemeCss(themeCss(), SCOPE);
    expect(scoped).toContain(`${SCOPE} {`);
    // No un-scoped `:root {` block start remains.
    expect(scoped).not.toMatch(/^:root \{/m);
  });

  it("prefixes [data-device] blocks under the scope root", () => {
    const scoped = scopeThemeCss(themeCss(), SCOPE);
    expect(scoped).toContain(`${SCOPE}[data-device="ios"] {`);
    expect(scoped).toContain(`${SCOPE}[data-device="tvos"] {`);
    // The bare, unscoped device selectors must be gone.
    expect(scoped).not.toMatch(/^\[data-device="(ios|tvos)"\] \{/m);
  });

  it("leaves @font-face rules at the top level (never nested/prefixed)", () => {
    const scoped = scopeThemeCss(themeCss(), SCOPE);
    const faceIdx = scoped.indexOf("@font-face");
    expect(faceIdx).toBeGreaterThan(-1);
    // @font-face precedes the scoped :root block and is not prefixed.
    expect(faceIdx).toBeLessThan(scoped.indexOf(`${SCOPE} {`));
    expect(scoped).not.toContain(`${SCOPE} @font-face`);
    expect(scoped).toMatch(/^@font-face \{/m);
  });

  it("prefixes component element rules (wa-badge) with the scope", () => {
    const raw = emitCss(
      generateTheme(
        resolveIdentity({ components: { badgeBackground: "brand-40" } }),
      ),
    );
    // Sanity: the CLI output is a bare, global element rule.
    expect(raw).toMatch(/^wa-badge \{/m);
    const scoped = scopeThemeCss(raw, SCOPE);
    expect(scoped).toContain(`${SCOPE} wa-badge {`);
    // The unscoped, global element rule must be gone.
    expect(scoped).not.toMatch(/^wa-badge \{/m);
  });
});

describe("buildScopedThemeCss", () => {
  it("uses the shared preview scope selector by default", () => {
    const identity = resolveIdentity();
    const scoped = buildScopedThemeCss(identity);
    expect(scoped).toContain(`${SCOPE} {`);
    expect(scoped).toContain(`${SCOPE}[data-device="ios"] {`);
  });

  it("only differs from the CLI CSS by the scoping rewrite", () => {
    const identity = resolveIdentity();
    const raw = emitCss(generateTheme(identity));
    expect(buildScopedThemeCss(identity)).toBe(scopeThemeCss(raw, SCOPE));
  });
});
