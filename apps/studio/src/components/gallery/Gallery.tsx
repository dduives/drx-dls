import { useRef } from "react";
import { Section } from "./Section.tsx";

const VARIANTS = ["brand", "neutral", "success", "warning", "danger"] as const;
const SIZES = ["small", "medium", "large"] as const;
const ICON_WEIGHTS = [
  "thin",
  "light",
  "regular",
  "bold",
  "fill",
  "duotone",
] as const;
const ICON_SAMPLE = [
  "house",
  "user",
  "gear",
  "bell",
  "magnifying-glass",
  "heart",
  "star",
  "chat-circle",
  "envelope",
  "calendar-blank",
  "download-simple",
  "trash",
] as const;

/** A WA dialog element also exposes an imperative `open` property. */
type WaOpenable = HTMLElement & { open: boolean };

/**
 * Center-pane component gallery (DRI-53). Renders real `<wa-*>` elements so the
 * scoped preview theme (`[data-drx-preview]`, injected by DRI-52) is shown on
 * true re-themed output. This component is purely presentational — it reads
 * nothing from identity; theming flows in entirely via inherited CSS vars, so
 * it MUST be rendered inside the `<main data-drx-preview>` scope root.
 */
export function Gallery() {
  const dialogRef = useRef<WaOpenable>(null);

  return (
    <div className="max-w-4xl">
      <Section
        title="Buttons — variants"
        description="All five semantic variants driven by the generated palette."
      >
        {VARIANTS.map((v) => (
          <wa-button key={v} variant={v}>
            {v[0]!.toUpperCase() + v.slice(1)}
          </wa-button>
        ))}
      </Section>

      <Section title="Buttons — outline & disabled">
        {VARIANTS.map((v) => (
          <wa-button key={v} variant={v} outline>
            {v[0]!.toUpperCase() + v.slice(1)}
          </wa-button>
        ))}
        <wa-button variant="brand" disabled>
          Disabled
        </wa-button>
        <wa-button variant="neutral" outline disabled>
          Disabled outline
        </wa-button>
      </Section>

      <Section title="Buttons — sizes & icon">
        {SIZES.map((s) => (
          <wa-button key={s} variant="brand" size={s}>
            {s[0]!.toUpperCase() + s.slice(1)}
          </wa-button>
        ))}
        <wa-button variant="brand">
          <wa-icon slot="start" name="download-simple" />
          Download
        </wa-button>
        <wa-button variant="neutral" outline pill>
          <wa-icon slot="start" name="star" />
          Pill
        </wa-button>
      </Section>

      <Section
        title="Form controls"
        description="Reflects the form-control token overrides (padding, border, radius)."
      >
        <div className="flex w-full flex-wrap gap-4">
          <wa-input label="Name" placeholder="Enter your name" />
          <wa-input label="Email" type="email" placeholder="you@example.com" />
          <wa-input
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <wa-select label="Role" value="editor">
            <wa-option value="viewer">Viewer</wa-option>
            <wa-option value="editor">Editor</wa-option>
            <wa-option value="admin">Admin</wa-option>
          </wa-select>
        </div>
        <div className="flex w-full flex-col gap-2">
          <wa-checkbox checked>Accept terms &amp; conditions</wa-checkbox>
          <wa-checkbox>Subscribe to the newsletter</wa-checkbox>
          <wa-switch checked>Enable notifications</wa-switch>
          <wa-switch>Dark mode preference</wa-switch>
        </div>
      </Section>

      <Section title="Badges">
        {VARIANTS.map((v) => (
          <wa-badge key={v} variant={v}>
            {v[0]!.toUpperCase() + v.slice(1)}
          </wa-badge>
        ))}
        <wa-badge variant="brand" pill>
          Pill
        </wa-badge>
      </Section>

      <Section title="Callouts">
        <div className="flex w-full flex-col gap-3">
          {VARIANTS.map((v) => (
            <wa-callout key={v} variant={v}>
              <wa-icon slot="icon" name="info" />
              <strong>{v[0]!.toUpperCase() + v.slice(1)}:</strong> Themed
              entirely via CSS custom properties from the generated theme.
            </wa-callout>
          ))}
        </div>
      </Section>

      <Section title="Card">
        <wa-card className="w-full max-w-md">
          <div
            slot="header"
            className="flex items-center justify-between"
          >
            <strong>Settings</strong>
            <wa-badge variant="success">Saved</wa-badge>
          </div>
          <div className="flex flex-col gap-3">
            <wa-switch checked>Enable notifications</wa-switch>
            <wa-checkbox checked>Accept terms &amp; conditions</wa-checkbox>
            <wa-divider />
            <p className="m-0 text-sm">
              Cards inherit the scoped surface, border, and radius tokens.
            </p>
          </div>
          <div slot="footer" className="flex gap-2">
            <wa-button variant="brand" size="small">
              Save
            </wa-button>
            <wa-button variant="neutral" size="small" outline>
              Cancel
            </wa-button>
          </div>
        </wa-card>
      </Section>

      <Section title="Tabs">
        <wa-tab-group className="w-full">
          <wa-tab panel="general">General</wa-tab>
          <wa-tab panel="appearance">Appearance</wa-tab>
          <wa-tab panel="advanced">Advanced</wa-tab>
          <wa-tab-panel name="general">
            General settings live here.
          </wa-tab-panel>
          <wa-tab-panel name="appearance">
            Appearance settings live here.
          </wa-tab-panel>
          <wa-tab-panel name="advanced">
            Advanced settings live here.
          </wa-tab-panel>
        </wa-tab-group>
      </Section>

      <Section
        title="Overlays & feedback"
        description="A dialog (opened by the trigger), a tooltip, and a spinner."
      >
        <wa-button
          variant="brand"
          onClick={() => {
            if (dialogRef.current) dialogRef.current.open = true;
          }}
        >
          Open dialog
        </wa-button>
        <wa-tooltip content="I'm a themed tooltip!">
          <wa-button variant="neutral" outline>
            Hover me
          </wa-button>
        </wa-tooltip>
        <wa-spinner style={{ fontSize: "1.5rem" }} />
        <wa-dialog ref={dialogRef} label="Themed dialog">
          This dialog and its surface, border, and radius come straight from the
          scoped preview theme.
          <div slot="footer">
            <wa-button
              variant="brand"
              onClick={() => {
                if (dialogRef.current) dialogRef.current.open = false;
              }}
            >
              Close
            </wa-button>
          </div>
        </wa-dialog>
      </Section>

      <Section
        title="Icons — Phosphor"
        description="Same glyph across the six Phosphor weights, then a name sampling."
      >
        <div
          className="flex w-full flex-wrap items-center gap-5"
          style={{ fontSize: "1.75rem" }}
        >
          {ICON_WEIGHTS.map((w) => (
            <wa-icon key={w} name="heart" variant={w} label={w} />
          ))}
        </div>
        <div
          className="flex w-full flex-wrap items-center gap-5"
          style={{ fontSize: "1.5rem" }}
        >
          {ICON_SAMPLE.map((n) => (
            <wa-icon key={n} name={n} label={n} />
          ))}
        </div>
      </Section>
    </div>
  );
}
