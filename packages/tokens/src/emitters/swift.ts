import type { DeviceName, ResolvedTheme } from "../types.js";
import { resolveColorRef, resolveScales, tintLabel } from "./shared.js";

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

function fontsEnum(theme: ResolvedTheme): string {
  const f = theme.identity.fontFamily;
  const faces = theme.identity.fontFaces;
  const faceLines = faces.map((face) => {
    const weight = face.weight ? `"${face.weight}"` : "nil";
    const style = face.style ? `"${face.style}"` : "nil";
    return `        (family: "${face.family}", src: "${face.src}", weight: ${weight}, style: ${style})`;
  });
  const facesLiteral =
    faceLines.length > 0 ? `[\n${faceLines.join(",\n")}\n    ]` : "[]";
  // Font *metadata* only — registering/loading custom fonts is an app-repo
  // concern on native (Info.plist / bundle resources). Passed through as-is.
  return `public enum DRXFonts {
    public static let body = "${f.body}"
    public static let heading = "${f.heading}"
    public static let code = "${f.code}"
    /// Custom @font-face metadata (web). Native apps must bundle/register these fonts themselves.
    public static let customFaces: [(family: String, src: String, weight: String?, style: String?)] = ${facesLiteral}
}`;
}

function formControlEnum(theme: ResolvedTheme): string {
  const fc = theme.identity.formControl;
  const border = resolveColorRef(fc.borderColor, theme);
  const comp = theme.identity.components;
  const lines = [
    `    public static let paddingBlock = "${fc.paddingBlock}"`,
    `    public static let paddingInline = "${fc.paddingInline}"`,
    `    public static let borderColor = Color(drxHex: "${border.hex}")`,
    `    public static let borderWidth = "${fc.borderWidth}"`,
    `    public static let borderStyle = "${fc.borderStyle}"`,
    `    public static let borderRadius = "${fc.borderRadius}"`,
  ];
  // DRI-100: optional background override, only emitted when set.
  if (comp.formControlBackground) {
    const bg = resolveColorRef(comp.formControlBackground, theme);
    lines.push(`    public static let background = Color(drxHex: "${bg.hex}")`);
  }
  return `public enum DRXFormControl {\n${lines.join("\n")}\n}`;
}

/**
 * DRI-100: per-component background overrides. Emitted only for families with a
 * set override, so native consumers can mirror the web preview.
 */
function componentsEnum(theme: ResolvedTheme): string {
  const comp = theme.identity.components;
  const lines: string[] = [];
  if (comp.badgeBackground) {
    const bg = resolveColorRef(comp.badgeBackground, theme);
    lines.push(
      `    public static let badgeBackground = Color(drxHex: "${bg.hex}")`,
    );
  }
  return `public enum DRXComponents {\n${lines.join("\n")}\n}`;
}

/** Emit DRXTheme.swift: variant palette + per-device scale knobs. */
export function emitSwift(theme: ResolvedTheme): string {
  const parts = [
    HEADER,
    paletteEnum(theme),
    fontsEnum(theme),
    formControlEnum(theme),
    componentsEnum(theme),
    scalesEnum(theme, "web"),
    scalesEnum(theme, "ios"),
    scalesEnum(theme, "tvos"),
  ];
  return parts.join("\n\n") + "\n";
}
