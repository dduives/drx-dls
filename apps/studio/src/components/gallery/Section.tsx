import type { ReactNode } from "react";

/**
 * Labeled gallery section — a heading plus a content row/grid. Studio chrome
 * (Tailwind, neutral-* palette); the WA components inside style themselves from
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
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      {description ? (
        <p className="mb-3 text-xs text-neutral-400">{description}</p>
      ) : (
        <div className="mb-3" />
      )}
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}
