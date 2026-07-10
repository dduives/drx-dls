import type { Appearance, DeviceName, ResolvedTheme } from "../types.js";
import { parseAlias, resolveDeviceMetrics } from "./shared.js";

const HEADER = `// drx-dls theme — generated, do not edit by hand.
import SwiftUI

public extension Color {
    /// Init from a "#RRGGBB" hex string.
    init(drxHex hex: String) {
        var s = hex
        if s.hasPrefix("#") { s.removeFirst() }
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        let r = Double((v >> 16) & 0xFF) / 255.0
        let g = Double((v >> 8) & 0xFF) / 255.0
        let b = Double(v & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }
}`;

function scaleEnum(theme: ResolvedTheme, appearance: Appearance): string {
  const name = appearance === "dark" ? "DRXColorsDark" : "DRXColorsLight";
  const lines: string[] = [];
  const { scales } = theme.colors[appearance];
  for (const [scale, set] of Object.entries(scales)) {
    set.solid.forEach((hex, i) => {
      lines.push(
        `    public static let ${scale}${i + 1} = Color(drxHex: "${hex}")`,
      );
    });
  }
  return `public enum ${name} {\n${lines.join("\n")}\n}`;
}

function aliasEnum(theme: ResolvedTheme): string {
  // Aliases resolve against the default appearance's scale enum.
  const def = theme.identity.appearance === "dark" ? "DRXColorsDark" : "DRXColorsLight";
  const lines = Object.entries(theme.aliases).map(([alias, ref]) => {
    const { scale, step } = parseAlias(ref);
    const prop = alias.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    return `    public static let ${prop} = ${def}.${scale}${step}`;
  });
  return `public enum DRXColor {\n${lines.join("\n")}\n}`;
}

function metricsEnum(theme: ResolvedTheme, device: DeviceName): string {
  const m = resolveDeviceMetrics(theme.identity, theme.devices[device]);
  const name = `DRXMetrics${device === "tvos" ? "TVOS" : device.toUpperCase()}`;
  return `public enum ${name} {
    public static let radius: CGFloat = ${m.radius}
    public static let fontSizeBase: CGFloat = ${m.fontSizeBase}
    public static let spacingBase: CGFloat = ${m.spacingBase}
    public static let spacingScale: CGFloat = ${m.spacingScale}
    public static let focusRingWidth: CGFloat = ${m.focusRingWidth}
    public static let safeArea: CGFloat = ${m.safeArea}
    public static let touchTarget: CGFloat = ${m.touchTarget}
}`;
}

/** Emit DRXTheme.swift: dark + light color enums, alias enum, per-device metrics. */
export function emitSwift(theme: ResolvedTheme): string {
  const parts = [
    HEADER,
    scaleEnum(theme, "dark"),
    scaleEnum(theme, "light"),
    aliasEnum(theme),
    metricsEnum(theme, "web"),
    metricsEnum(theme, "ios"),
    metricsEnum(theme, "tvos"),
  ];
  return parts.join("\n\n") + "\n";
}
