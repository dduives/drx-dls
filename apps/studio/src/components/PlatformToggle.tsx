import type { DeviceName } from "@drx-dls/tokens";
import { useDevice } from "../state/useDevice.ts";

const DEVICES: { value: DeviceName; label: string }[] = [
  { value: "web", label: "Web" },
  { value: "ios", label: "iOS" },
  { value: "tvos", label: "tvOS" },
];

/**
 * Top-bar segmented control (DRI-54) selecting the active device. Switching
 * device retargets the scale sliders, the preview `data-device` + chrome, and
 * the default per-device CSS export — all via the shared `useDevice()` state.
 * Colors/typography/form-control stay shared across devices.
 */
export function PlatformToggle() {
  const { device, setDevice } = useDevice();

  return (
    <div
      role="group"
      aria-label="Preview platform"
      className="inline-flex overflow-hidden rounded border border-neutral-200 text-xs"
    >
      {DEVICES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setDevice(value)}
          aria-pressed={device === value}
          className={
            "px-2 py-1 " +
            (device === value
              ? "bg-neutral-800 text-white"
              : "bg-white text-neutral-600 hover:bg-neutral-100")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
