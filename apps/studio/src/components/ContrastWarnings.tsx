import { useMemo } from "react";
import { generateTheme, checkContrast, formatViolation } from "@drx-dls/tokens";
import { useThemeInputs } from "../state/useThemeInputs.ts";

/**
 * Advisory WCAG AA contrast panel. Runs @drx-dls/tokens' `checkContrast` over
 * the live theme and lists any text/surface pairs (per WebAwesome's default
 * light-mode semantic layer) that fall below AA. Advisory only — never blocks
 * editing or export. The control panel (studio-controls) sits alongside this.
 */
export function ContrastWarnings() {
  const { identity } = useThemeInputs();
  const report = useMemo(
    () => checkContrast(generateTheme(identity)),
    [identity],
  );

  if (report.passes) {
    return (
      <p className="rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
        ✓ Contrast: all variants pass WCAG AA
      </p>
    );
  }

  return (
    <div className="rounded-md bg-amber-50 px-2 py-2 text-xs text-amber-800">
      <p className="mb-1 font-semibold">
        ⚠ {report.violations.length} contrast warning
        {report.violations.length === 1 ? "" : "s"} (advisory)
      </p>
      <ul className="space-y-0.5">
        {report.violations.map((v) => (
          <li key={`${v.variant}-${v.role}`}>{formatViolation(v)}</li>
        ))}
      </ul>
    </div>
  );
}
