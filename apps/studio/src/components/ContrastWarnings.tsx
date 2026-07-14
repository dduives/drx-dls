import { useMemo } from "react";
import { generateTheme, checkContrast, formatViolation } from "@drx-dls/tokens";
import { useThemeInputs } from "../state/useThemeInputs.ts";

/**
 * Advisory WCAG AA contrast check. Runs @drx-dls/tokens' `checkContrast` over
 * the live theme and lists any text/surface pairs (per WebAwesome's default
 * light-mode semantic layer) that fall below AA. Advisory only — never blocks
 * editing or export.
 *
 * Presented as a collapsed-by-default summary badge (DRI-98) so it stays
 * discoverable without dominating the color controls: a compact pass/count
 * line that expands on click to reveal the per-variant details.
 */
export function ContrastWarnings() {
  const { identity } = useThemeInputs();
  const report = useMemo(
    () => checkContrast(generateTheme(identity)),
    [identity],
  );

  const count = report.violations.length;

  return (
    <details className="group rounded-md border border-neutral-200 text-xs">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2 py-1 text-neutral-600 marker:content-none">
        <span
          className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
            report.passes ? "bg-emerald-500" : "bg-amber-400"
          }`}
          aria-hidden="true"
        />
        <span className="flex-1">
          {report.passes
            ? "Contrast: passes WCAG AA"
            : `Contrast: ${count} warning${count === 1 ? "" : "s"} (advisory)`}
        </span>
        <span className="text-neutral-400 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-neutral-200 px-2 py-1.5">
        {report.passes ? (
          <p className="text-neutral-500">
            All checked text/surface pairs meet WCAG AA in default light mode.
          </p>
        ) : (
          <ul className="space-y-0.5 text-amber-800">
            {report.violations.map((v) => (
              <li key={`${v.variant}-${v.role}`}>{formatViolation(v)}</li>
            ))}
          </ul>
        )}
        <p className="mt-1.5 text-[11px] text-neutral-400">
          Advisory only — never blocks editing or export.
        </p>
      </div>
    </details>
  );
}
