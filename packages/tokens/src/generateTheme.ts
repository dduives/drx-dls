import baseTokens from "../base.tokens.json" with { type: "json" };
import { anchorTintFor, deriveOnColor, deriveScale } from "./deriveScale.js";
import Color from "colorjs.io";
import type {
  BaseTokens,
  DeviceName,
  DeviceOverride,
  Identity,
  ResolvedTheme,
  ThemeInputs,
  TintScale,
  VariantCore,
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

const DEVICES: DeviceName[] = ["web", "ios", "tvos"];

/** Deep-merge per-app device overrides over the base device multipliers. */
function resolveDevices(
  inputs: ThemeInputs,
): Record<DeviceName, DeviceOverride> {
  const baseDevices = BASE.devices;
  const overrides = inputs.devices ?? {};
  return Object.fromEntries(
    DEVICES.map((device): [DeviceName, DeviceOverride] => [
      device,
      { ...baseDevices[device], ...(overrides[device] ?? {}) },
    ]),
  ) as Record<DeviceName, DeviceOverride>;
}

/** Merge per-app inputs over the base identity. */
export function resolveIdentity(inputs: ThemeInputs = {}): Identity {
  const base = BASE.identity;
  return {
    ...base,
    ...inputs,
    variants: { ...base.variants, ...(inputs.variants ?? {}) },
    fontFamily: { ...base.fontFamily, ...(inputs.fontFamily ?? {}) },
    fontFaces: inputs.fontFaces ?? base.fontFaces ?? [],
    formControl: { ...base.formControl, ...(inputs.formControl ?? {}) },
    components: { ...base.components, ...(inputs.components ?? {}) },
    paletteOverrides: inputs.paletteOverrides ?? base.paletteOverrides ?? {},
    devices: resolveDevices(inputs),
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
      deriveScale(
        identity.variants[variant],
        BASE.tints,
        identity.paletteOverrides[variant] ?? {},
      ),
    ]),
  ) as Record<VariantName, TintScale[]>;

  // Core color per variant (DRI-119): the exact base hex is the source of truth
  // — emitted verbatim as --wa-color-{variant}, with a derived on-color and the
  // ramp step it anchors on.
  const core = Object.fromEntries(
    VARIANTS.map((variant): [VariantName, VariantCore] => {
      const hex = identity.variants[variant];
      return [
        variant,
        {
          base: new Color(hex).to("srgb").toString({ format: "hex" }),
          on: deriveOnColor(hex),
          anchorTint: anchorTintFor(hex, BASE.tints),
        },
      ];
    }),
  ) as Record<VariantName, VariantCore>;

  return {
    name: BASE.name,
    identity,
    tints: BASE.tints,
    palette,
    core,
    devices: identity.devices,
  };
}

/** Access the raw base structure (for tooling / Studio). */
export function getBaseTokens(): BaseTokens {
  return BASE;
}
