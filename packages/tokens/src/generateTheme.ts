import baseTokens from "../base.tokens.json" with { type: "json" };
import { generateRadixColors } from "./vendor/generateRadixColors.js";
import type {
  Appearance,
  BaseTokens,
  Identity,
  ResolvedColors,
  ResolvedTheme,
  ThemeInputs,
} from "./types.js";

const BASE = baseTokens as unknown as BaseTokens;

const APPEARANCES: Appearance[] = ["light", "dark"];

/** Merge per-app inputs over the base identity. */
export function resolveIdentity(inputs: ThemeInputs = {}): Identity {
  const base = BASE.identity;
  return {
    ...base,
    ...inputs,
    fontFamily: { ...base.fontFamily, ...(inputs.fontFamily ?? {}) },
  };
}

/** Run the Radix generator for one appearance and shape it into ResolvedColors. */
function resolveColors(
  identity: Identity,
  appearance: Appearance,
): ResolvedColors {
  const result = generateRadixColors({
    appearance,
    accent: identity.accent,
    gray: identity.gray,
    background:
      appearance === "dark" ? identity.backgroundDark : identity.backgroundLight,
  });

  return {
    scales: {
      accent: { solid: result.accentScale, alpha: result.accentScaleAlpha },
      gray: { solid: result.grayScale, alpha: result.grayScaleAlpha },
    },
    contrast: result.accentContrast,
    background: result.background,
    graySurface: result.graySurface,
    accentSurface: result.accentSurface,
  };
}

/**
 * Expand per-app identity inputs into a fully resolved theme: real Radix
 * 12-step scales (+ alpha + accent-contrast) for light and dark, plus aliases
 * and device layers. Same function the CLI and the Studio preview call.
 */
export function generateTheme(inputs: ThemeInputs = {}): ResolvedTheme {
  const identity = resolveIdentity(inputs);

  const colors = Object.fromEntries(
    APPEARANCES.map((appearance): [Appearance, ResolvedColors] => [
      appearance,
      resolveColors(identity, appearance),
    ]),
  ) as Record<Appearance, ResolvedColors>;

  return {
    name: BASE.name,
    identity,
    colors,
    aliases: BASE.aliases,
    devices: BASE.devices,
  };
}

/** Access the raw base structure (for tooling / Studio). */
export function getBaseTokens(): BaseTokens {
  return BASE;
}
