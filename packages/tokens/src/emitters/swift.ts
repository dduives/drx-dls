import type { DeviceName, ResolvedTheme } from "../types.js";
import { resolveScales, tintLabel } from "./shared.js";

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

function paletteEnum(theme: ResolvedTheme): string {
  const lines: string[] = [];
  for (const [variant, scale] of Object.entries(theme.palette)) {
    for (const { tint, hex } of scale) {
      lines.push(
        `    public static let ${variant}${tintLabel(tint)} = Color(drxHex: "${hex}")`,
      );
    }
  }
  return `public enum DRXPalette {\n${lines.join("\n")}\n}`;
}

function scalesEnum(theme: ResolvedTheme, device: DeviceName): string {
  const s = resolveScales(theme.identity, theme.devices[device]);
  const name = `DRXScales${device === "tvos" ? "TVOS" : device.toUpperCase()}`;
  return `public enum ${name} {
    public static let radiusScale: CGFloat = ${s.radiusScale}
    public static let spaceScale: CGFloat = ${s.spaceScale}
    public static let fontSizeScale: CGFloat = ${s.fontSizeScale}
    public static let borderWidthScale: CGFloat = ${s.borderWidthScale}
}`;
}

/** Emit DRXTheme.swift: variant palette + per-device scale knobs. */
export function emitSwift(theme: ResolvedTheme): string {
  const parts = [
    HEADER,
    paletteEnum(theme),
    scalesEnum(theme, "web"),
    scalesEnum(theme, "ios"),
    scalesEnum(theme, "tvos"),
  ];
  return parts.join("\n\n") + "\n";
}
