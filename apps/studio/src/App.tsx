// Theme Studio — visual editor over @drx-dls/tokens.
// This shell only lays out the three regions; controls, live preview,
// gallery, platform toggle, and export are wired in by their own todos
// (studio-controls, studio-live-preview, studio-gallery,
// studio-platform-toggle, studio-export). The shared inputs state
// (studio-state) is already live via useThemeInputs().
import { useThemeInputs } from "./state/useThemeInputs.ts";
import { usePreviewTheme } from "./state/usePreviewTheme.ts";
import { PREVIEW_SCOPE_ATTR } from "./lib/scopedTheme.ts";
import { ContrastWarnings } from "./components/ContrastWarnings.tsx";
import { FontFacesEditor } from "./components/FontFacesEditor.tsx";
import { ProjectSwitcher } from "./components/ProjectSwitcher.tsx";

function App() {
  const { identity } = useThemeInputs();

  // Live preview (DRI-52): inject the scoped --wa-* theme, keyed on identity.
  usePreviewTheme(identity);

  return (
    <div className="flex h-screen w-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Theme Studio</span>
          <ProjectSwitcher />
        </div>
        <span className="text-sm text-neutral-500">
          {/* mode toggle / platform toggle / export land here */}
        </span>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-r border-neutral-200 p-4">
          {/* control panel lands here; identity.variants.brand = {identity.variants.brand} */}
          <ContrastWarnings />
          <FontFacesEditor />
        </aside>
        <main
          {...{ [PREVIEW_SCOPE_ATTR]: "" }}
          className="flex-1 overflow-y-auto p-4"
        >
          {/* This <main> IS the preview pane + theme scope root. DRI-54's
              platform toggle sets data-device="ios"|"tvos" on this same
              element to activate the scoped device override blocks. */}
          {/* live component gallery lands here (DRI-53) */}
          <p className="text-sm text-neutral-400">
            Loaded identity for &ldquo;{identity.fontFamily.body.split(",")[0]}
            &rdquo; — brand base {identity.variants.brand}
          </p>
          {/* Proof the scoped --wa-* vars apply (real gallery is DRI-53). */}
          <div
            className="mt-4 inline-block rounded"
            style={{
              background: "var(--wa-color-brand-50)",
              color: "var(--wa-color-brand-95)",
              borderRadius:
                "calc(0.5rem * var(--wa-border-radius-scale, 1))",
              padding: "calc(0.5rem * var(--wa-space-scale, 1))",
              fontFamily: "var(--wa-font-family-body)",
            }}
          >
            Live preview swatch
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
