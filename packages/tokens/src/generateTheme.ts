import baseTokens from "../base.tokens.json" with { type: "json" };
import { generateScaleSet } from "./generateScale.js";
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

/**
 * Expand per-app identity inputs into a fully resolved theme:
 * every color scale generated for light + dark, plus aliases and device layers.
 * Same function the CLI and the Studio preview call.
 */
export function generateTheme(inputs: ThemeInputs = {}): ResolvedTheme {
  const identity = resolveIdentity(inputs);

  const colors = Object.fromEntries(
    APPEARANCES.map((appearance): [Appearance, ResolvedColors] => {
      const scales = Object.fromEntries(
        BASE.scales.map((scaleName) => {
          const baseColor =
            scaleName === "gray" ? identity.gray : identity.accent;
          return [scaleName, generateScaleSet(baseColor, appearance)];
        }),
      );
      return [appearance, { scales }];
    }),
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
