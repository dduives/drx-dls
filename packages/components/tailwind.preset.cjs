/**
 * drx-dls Tailwind preset.
 *
 * Maps the CSS custom properties emitted by @drx-dls/tokens (theme.css) onto
 * Tailwind utilities, so components — and consuming apps — style with semantic
 * classes (bg-solid, text-fg, border-border, rounded-card) that re-theme purely
 * by swapping the loaded theme.css. No hardcoded colors anywhere.
 *
 * Consuming apps: add this to `presets` and include the package in `content`.
 */

/** Build a 1..12 scale object backed by --{name}-{step} vars. */
function scale(name) {
  const out = {};
  for (let i = 1; i <= 12; i++) out[i] = `var(--${name}-${i})`;
  return out;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Raw 12-step scales for fine control.
        accent: scale("accent"),
        gray: scale("gray"),

        // Semantic aliases (preferred in component code).
        bg: "var(--color-bg)",
        "bg-subtle": "var(--color-bg-subtle)",
        surface: "var(--color-surface)",
        element: "var(--color-element)",
        "element-hover": "var(--color-element-hover)",
        "element-active": "var(--color-element-active)",
        "border-subtle": "var(--color-border-subtle)",
        border: "var(--color-border)",
        "border-hover": "var(--color-border-hover)",
        muted: "var(--color-muted)",
        fg: "var(--color-fg)",

        solid: "var(--color-solid)",
        "solid-hover": "var(--color-solid-hover)",
        "solid-fg": "var(--color-solid-fg)",
        "accent-bg": "var(--color-accent-bg)",
        "accent-border": "var(--color-accent-border)",
        "accent-text": "var(--color-accent-text)",
        focus: "var(--color-focus-ring)",
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        card: "var(--radius)",
        control: "calc(var(--radius) * 0.75)",
        pill: "9999px",
      },
      ringColor: {
        DEFAULT: "var(--color-focus-ring)",
        focus: "var(--color-focus-ring)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        base: "var(--font-size-base)",
      },
    },
  },
};
