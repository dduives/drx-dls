import { describe, expect, it } from "vitest";
import { generateTheme, resolveIdentity } from "../src/generateTheme.js";
import { emitCss, emitJson } from "../src/emitters/index.js";
import { resolveScales } from "../src/emitters/shared.js";
import { validateThemeInputs } from "../src/schema.js";

describe("per-device scale overrides", () => {
  it("resolveIdentity exposes fully resolved devices from base when no overrides", () => {
    const id = resolveIdentity();
    expect(id.devices.web).toEqual({
      radiusScale: 1.0,
      spaceScale: 1.0,
      fontSizeScale: 1.0,
      borderWidthScale: 1.0,
    });
    expect(id.devices.ios).toEqual({
      radiusScale: 1.2,
      spaceScale: 1.1,
      fontSizeScale: 1.06,
      borderWidthScale: 1.0,
    });
    expect(id.devices.tvos.fontSizeScale).toBe(1.6);
  });

  it("deep-merges per-app device overrides per knob, falling back to base", () => {
    const id = resolveIdentity({
      devices: { ios: { radiusScale: 1.25, fontSizeScale: 1.1 } },
    });
    // overridden knobs
    expect(id.devices.ios.radiusScale).toBe(1.25);
    expect(id.devices.ios.fontSizeScale).toBe(1.1);
    // untouched knobs keep base device values
    expect(id.devices.ios.spaceScale).toBe(1.1);
    expect(id.devices.ios.borderWidthScale).toBe(1.0);
    // other devices untouched
    expect(id.devices.tvos.fontSizeScale).toBe(1.6);
    expect(id.devices.web.radiusScale).toBe(1.0);
  });

  it("generateTheme returns the resolved devices", () => {
    const theme = generateTheme({
      devices: { tvos: { spaceScale: 1.5 } },
    });
    expect(theme.devices.tvos.spaceScale).toBe(1.5);
    // resolveScales reads theme.devices[device]
    const s = resolveScales(theme.identity, theme.devices.tvos);
    expect(s.spaceScale).toBe(1.5);
  });
});

describe("emitCss standalone (per-device)", () => {
  it("puts the device's resolved scales in :root and omits [data-device] blocks", () => {
    const theme = generateTheme();
    const css = emitCss(theme, { device: "ios" });
    expect(css).not.toContain("[data-device=");
    expect(css).toContain("— ios —");
    // iOS resolved scales in :root
    expect(css).toContain("--wa-border-radius-scale: 1.2;");
    expect(css).toContain("--wa-font-size-scale: 1.06;");
  });

  it("reflects per-app overrides in the standalone :root scales", () => {
    const theme = generateTheme({
      devices: { ios: { radiusScale: 1.25 } },
    });
    const css = emitCss(theme, { device: "ios" });
    expect(css).toContain("--wa-border-radius-scale: 1.25;");
  });

  it("still emits @font-face rules at the top", () => {
    const theme = generateTheme({
      fontFaces: [{ family: "Inter", src: "https://x/Inter.woff2" }],
    });
    const css = emitCss(theme, { device: "tvos" });
    expect(css.indexOf("@font-face")).toBeGreaterThan(-1);
    expect(css.indexOf("@font-face")).toBeLessThan(css.indexOf(":root"));
  });
});

describe("emitCss combined (default) regression", () => {
  it("is unchanged for an override-free identity", () => {
    const theme = generateTheme();
    const css = emitCss(theme);
    // web scales in :root
    expect(css).toContain("--wa-border-radius-scale: 1;");
    // [data-device] blocks present
    expect(css).toContain('[data-device="ios"] {');
    expect(css).toContain('[data-device="tvos"] {');
    // combined header (no device suffix)
    expect(css).toContain("/* drx-dls theme:");
    expect(css).not.toContain("— ios —");
  });
});

describe("validateThemeInputs devices", () => {
  it("accepts a valid devices block", () => {
    const result = validateThemeInputs({
      version: 2,
      devices: { ios: { radiusScale: 1.25 }, tvos: { fontSizeScale: 1.7 } },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects unknown device keys", () => {
    const result = validateThemeInputs({ devices: { desktop: {} } });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "devices.desktop")).toBe(true);
  });

  it("rejects non-numeric knobs and unknown knobs", () => {
    const result = validateThemeInputs({
      devices: { ios: { radiusScale: "big", bogus: 1 } },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "devices.ios.radiusScale")).toBe(
      true,
    );
    expect(result.errors.some((e) => e.path === "devices.ios.bogus")).toBe(true);
  });

  it("rejects a non-object devices value", () => {
    const result = validateThemeInputs({ devices: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path === "devices")).toBe(true);
  });
});

describe("round-trip: emitJson includes resolved devices", () => {
  it("emits per-device resolved scales", () => {
    const theme = generateTheme({ devices: { ios: { radiusScale: 1.25 } } });
    const json = JSON.parse(emitJson(theme));
    expect(json.devices.ios.radiusScale).toBe(1.25);
    expect(json.identity.devices.ios.radiusScale).toBe(1.25);
  });
});
