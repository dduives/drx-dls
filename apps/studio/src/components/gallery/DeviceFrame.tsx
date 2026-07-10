import type { ReactNode } from "react";
import type { DeviceName } from "@drx-dls/tokens";

/**
 * Approximate device chrome (DRI-54) wrapping the real-component gallery to
 * communicate per-device SIZING/PROPORTION — deliberately NOT pixel-true:
 *   - **web**  → no frame, accurate real-component gallery as-is.
 *   - **ios**  → a phone-ish bezel (narrow max-width, rounded corners).
 *   - **tvos** → a wide, 10-foot / TV-proportioned frame with a larger baseline
 *     PLUS a simulated focus ring (CSS glow/outline evoking the tvOS focus
 *     engine) on a representative focused element.
 * Actual token sizing comes from the scoped `data-device` CSS (DRI-52) applied
 * on the parent preview root — this only supplies approximate framing chrome.
 */
export function DeviceFrame({
  device,
  children,
}: {
  device: DeviceName;
  children: ReactNode;
}) {
  if (device === "web") {
    return <>{children}</>;
  }

  const disclaimer = (
    <p className="mb-3 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
      Approximate preview — not pixel-true
    </p>
  );

  if (device === "ios") {
    return (
      <div className="flex flex-col items-center">
        {disclaimer}
        <div className="w-full max-w-[420px] rounded-[2.5rem] border-[10px] border-neutral-800 bg-white p-4 shadow-xl">
          <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-neutral-300" />
          {children}
        </div>
      </div>
    );
  }

  // tvOS: wide 10-foot frame with a simulated focus ring around the gallery.
  return (
    <div className="flex flex-col items-center">
      {disclaimer}
      <div className="w-full max-w-[1100px] rounded-2xl border-[12px] border-neutral-900 bg-neutral-950 p-6 shadow-2xl">
        {/* Simulated tvOS focus engine: a glowing focus ring on the focused
            representative element (CSS only, approximate). */}
        <div className="rounded-xl bg-white p-6 text-[112.5%] outline outline-4 outline-offset-4 outline-sky-400 ring-4 ring-sky-300/50 [box-shadow:0_0_0_6px_rgba(56,189,248,0.35),0_12px_40px_rgba(56,189,248,0.45)]">
          {children}
        </div>
      </div>
    </div>
  );
}
