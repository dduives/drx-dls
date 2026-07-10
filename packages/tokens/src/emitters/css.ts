import type { Appearance, DeviceName, ResolvedTheme } from "../types.js";
import { parseAlias, resolveDeviceMetrics } from "./shared.js";

function scaleVars(theme: ResolvedTheme, appearance: Appearance): string[] {
  const out: string[] = [];
  const c = theme.colors[appearance];
  for (const [name, set] of Object.entries(c.scales)) {
    set.solid.forEach((hex, i) => out.push(`  --${name}-${i + 1}: ${hex};`));
    set.alpha.forEach((hex, i) => out.push(`  --${name}-a${i + 1}: ${hex};`));
  }
  // Per-appearance specials (contrast + surfaces + background differ by mode).
  out.push(`  --accent-contrast: ${c.contrast};`);
  out.push(`  --accent-surface: ${c.accentSurface};`);
  out.push(`  --gray-surface: ${c.graySurface};`);
  out.push(`  --color-background: ${c.background};`);
  return out;
}

function aliasVars(theme: ResolvedTheme): string[] {
  const out = Object.entries(theme.aliases).map(([alias, ref]) => {
    const { scale, step } = parseAlias(ref);
    return `  --${alias}: var(--${scale}-${step});`;
  });
  // Text color for solid (step 9) surfaces = the generator's accent-contrast.
  out.push(`  --color-solid-fg: var(--accent-contrast);`);
  return out;
}

function fontVars(theme: ResolvedTheme): string[] {
  return [
    `  --font-sans: ${theme.identity.fontFamily.sans};`,
    `  --font-mono: ${theme.identity.fontFamily.mono};`,
  ];
}

function deviceVars(theme: ResolvedTheme, device: DeviceName): string[] {
  const m = resolveDeviceMetrics(theme.identity, theme.devices[device]);
  return [
    `  --radius: ${m.radius}px;`,
    `  --font-size-base: ${m.fontSizeBase}px;`,
    `  --spacing-base: ${m.spacingBase}px;`,
    `  --spacing-scale: ${m.spacingScale};`,
    `  --focus-ring-width: ${m.focusRingWidth}px;`,
    `  --safe-area: ${m.safeArea}px;`,
    `  --touch-target: ${m.touchTarget}px;`,
  ];
}

/** Emit a theme.css with :root (default appearance + web device), plus
 *  [data-mode] and [data-device] override blocks. */
export function emitCss(theme: ResolvedTheme): string {
  const def = theme.identity.appearance;
  const blocks: string[] = [];

  blocks.push(
    `/* drx-dls theme: ${theme.name} — generated, do not edit by hand */`,
  );

  blocks.push(
    `:root {\n` +
      [
        ...scaleVars(theme, def),
        ...aliasVars(theme),
        ...fontVars(theme),
        ...deviceVars(theme, "web"),
      ].join("\n") +
      `\n}`,
  );

  for (const appearance of ["light", "dark"] as Appearance[]) {
    blocks.push(
      `[data-mode="${appearance}"] {\n` +
        scaleVars(theme, appearance).join("\n") +
        `\n}`,
    );
  }

  for (const device of ["ios", "tvos"] as DeviceName[]) {
    blocks.push(
      `[data-device="${device}"] {\n` +
        deviceVars(theme, device).join("\n") +
        `\n}`,
    );
  }

  return blocks.join("\n\n") + "\n";
}
