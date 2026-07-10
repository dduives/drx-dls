// Theme Studio — visual editor over @drx-dls/tokens.
// This shell only lays out the three regions; controls, live preview,
// gallery, platform toggle, and export are wired in by their own todos
// (studio-controls, studio-live-preview, studio-gallery,
// studio-platform-toggle, studio-export). The shared inputs state
// (studio-state) is already live via useThemeInputs().
import { useThemeInputs } from "./state/useThemeInputs.ts";
import { usePreviewTheme } from "./state/usePreviewTheme.ts";
import { PREVIEW_SCOPE_ATTR } from "./lib/scopedTheme.ts";
import { ProjectSwitcher } from "./components/ProjectSwitcher.tsx";
import { ControlPanel } from "./components/controls/ControlPanel.tsx";
import { ModeToggle } from "./components/controls/ModeToggle.tsx";
import { Gallery } from "./components/gallery/Gallery.tsx";

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
        <span className="flex items-center gap-3 text-sm text-neutral-500">
          {/* platform toggle / export land here alongside the mode toggle */}
          <ModeToggle />
        </span>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-neutral-200 p-4">
          <ControlPanel />
        </aside>
        <main
          {...{ [PREVIEW_SCOPE_ATTR]: "" }}
          className="flex-1 overflow-y-auto p-6"
        >
          {/* This <main> IS the preview pane + theme scope root. DRI-54's
              platform toggle sets data-device="ios"|"tvos" on this same
              element to activate the scoped device override blocks. The gallery
              MUST live inside it so the real <wa-*> components inherit the
              scoped --wa-* vars (CSS custom properties pierce shadow DOM). */}
          <p className="mb-6 text-sm text-neutral-400">
            Previewing &ldquo;{identity.fontFamily.body.split(",")[0]}&rdquo; —
            brand base {identity.variants.brand}
          </p>
          <Gallery />
        </main>
      </div>
    </div>
  );
}

export default App;
