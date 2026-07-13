// Theme Studio — visual editor over @drx-dls/tokens.
// This shell only lays out the three regions; controls, live preview,
// gallery, platform toggle, and export are wired in by their own todos
// (studio-controls, studio-live-preview, studio-gallery,
// studio-platform-toggle, studio-export). The shared inputs state
// (studio-state) is already live via useThemeInputs().
import { lazy, Suspense } from "react";
import { useThemeInputs } from "./state/useThemeInputs.ts";
import { usePreviewTheme } from "./state/usePreviewTheme.ts";
import { useDevice } from "./state/useDevice.ts";
import { useColorScheme } from "./state/useColorScheme.ts";
import { PREVIEW_SCOPE_ATTR } from "./lib/scopedTheme.ts";
import { ProjectSwitcher } from "./components/ProjectSwitcher.tsx";
import { ExportControls } from "./components/ExportControls.tsx";
import { ControlPanel } from "./components/controls/ControlPanel.tsx";
import { ModeToggle } from "./components/controls/ModeToggle.tsx";
import { PlatformToggle } from "./components/PlatformToggle.tsx";
import { DeviceFrame } from "./components/gallery/DeviceFrame.tsx";

// Code-split the WebAwesome-heavy gallery (and its component registration) out
// of the initial chunk (DRI-68). It's fetched on first render of the preview.
const Gallery = lazy(() => import("./components/gallery/GalleryLazy.tsx"));

function App() {
  const { identity } = useThemeInputs();
  const { device } = useDevice();
  const { resolvedDark } = useColorScheme();

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
          <PlatformToggle />
          <ModeToggle />
          <ExportControls />
        </span>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-neutral-200 p-4">
          <ControlPanel />
        </aside>
        <main
          {...{ [PREVIEW_SCOPE_ATTR]: "" }}
          {...(device !== "web" ? { "data-device": device } : {})}
          className={`flex-1 overflow-y-auto p-6 ${resolvedDark ? "wa-dark" : "wa-light"}`}
        >
          {/* This <main> IS the preview pane + theme scope root. DRI-54's
              platform toggle sets data-device="ios"|"tvos" on this same
              element to activate the scoped device override blocks (there is no
              [data-device="web"] block — web scales live in the scoped :root —
              so the attribute is set only for ios/tvos). The gallery MUST live
              inside it so the real <wa-*> components inherit the scoped --wa-*
              vars (CSS custom properties pierce shadow DOM).

              The wa-light/wa-dark class (DRI-91) is critical: WebAwesome
              declares its semantic role tokens and scale-derived tokens on the
              element carrying that class, resolving var()/calc() against that
              element's inputs. Placing it here — on the same element as the
              scoped palette/scale overrides — makes WA recompute the whole
              derived layer from the live-edited inputs, so color and scale
              changes reflect instantly. */}
          <p className="mb-6 text-sm text-neutral-400">
            Previewing &ldquo;{identity.fontFamily.body.split(",")[0]}&rdquo; —
            brand base {identity.variants.brand}
          </p>
          <DeviceFrame device={device}>
            <Suspense
              fallback={
                <p className="text-sm text-neutral-400">Loading preview…</p>
              }
            >
              <Gallery />
            </Suspense>
          </DeviceFrame>
        </main>
      </div>
    </div>
  );
}

export default App;
