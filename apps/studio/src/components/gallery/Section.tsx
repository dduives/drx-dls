import type { ReactNode } from "react";

/**
 * Labeled gallery section — a heading plus a content row/grid. The section
 * labels are preview-surface chrome: they read WebAwesome surface text tokens
 * (`--wa-color-text-quiet`) so they follow the preview color scheme (DRI-93)
 * instead of hardcoded neutrals. The WA components inside style themselves from
 * the scoped `--wa-*` theme.
 */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--wa-color-text-quiet)]">
        {title}
      </h2>
      {description ? (
        <p className="mb-3 text-xs text-[var(--wa-color-text-quiet)]">
          {description}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}
