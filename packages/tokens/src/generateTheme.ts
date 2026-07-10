import baseTokens from "../base.tokens.json" with { type: "json" };
import { deriveScale } from "./deriveScale.js";
import type {
  BaseTokens,
  Identity,
  ResolvedTheme,
  ThemeInputs,
  TintScale,
  VariantName,
} from "./types.js";

const BASE = baseTokens as unknown as BaseTokens;

const VARIANTS: VariantName[] = [
  "brand",
  "neutral",
  "success",
  "warning",
  "danger",
];

/** Merge per-app inputs over the base identity. */
export function resolveIdentity(inputs: ThemeInputs = {}): Identity {
  const base = BASE.identity;
  return {
    ...base,
    ...inputs,
    variants: { ...base.variants, ...(inputs.variants ?? {}) },
    fontFamily: { ...base.fontFamily, ...(inputs.fontFamily ?? {}) },
  };
}

/**
 * Expand per-app identity inputs into a fully resolved theme: an 11-tint
 * WebAwesome palette per variant (mode-independent) plus device scale layers.
 * Same function the CLI and the Studio preview call.
 */
export function generateTheme(inputs: ThemeInputs = {}): ResolvedTheme {
  const identity = resolveIdentity(inputs);

  const palette = Object.fromEntries(
    VARIANTS.map((variant): [VariantName, TintScale[]] => [
      variant,
      deriveScale(identity.variants[variant], BASE.tints),
    ]),
  ) as Record<VariantName, TintScale[]>;

  return {
    name: BASE.name,
    identity,
    tints: BASE.tints,
    palette,
    devices: BASE.devices,
  };
}

/** Access the raw base structure (for tooling / Studio). */
export function getBaseTokens(): BaseTokens {
  return BASE;
}
