import { describe, expect, it } from "vitest";
import {
  emitCss,
  generateTheme,
  resolveIdentity,
  type DeviceName,
} from "@drx-dls/tokens";
import { buildThemeCss } from "../src/lib/exportTheme.ts";

// iOS/tvOS have non-1.0 base scale multipliers in base.tokens.json, so their
// standalone :root output must differ from web.
function identity() {
  return resolveIdentity({ devices: { ios: { radiusScale: 1.25 } } });
}

describe("per-device standalone export (buildThemeCss(identity, device))", () => {
  it("emits the device's resolved scales in :root with NO [data-device] blocks", () => {
    const css = buildThemeCss(identity(), "ios");
    expect(css).not.toContain("[data-device=");
    expect(css).toContain("— ios —");
    // iOS overridden radius + base ios font-size scale, baked into :root.
    expect(css).toContain("--wa-border-radius-scale: 1.25;");
    expect(css).toContain("--wa-font-size-scale: 1.06;");
  });

  it("matches tokens emitCss(theme, { device }) byte-for-byte per device", () => {
    const id = identity();
    for (const device of ["web", "ios", "tvos"] as DeviceName[]) {
      expect(buildThemeCss(id, device)).toBe(
        emitCss(generateTheme(id), { device }),
      );
    }
  });

  it("combined export (no device) keeps the [data-device] override blocks", () => {
    const css = buildThemeCss(identity());
    expect(css).toContain('[data-device="ios"] {');
    expect(css).toContain('[data-device="tvos"] {');
    expect(css).not.toContain("— ios —");
  });
});
