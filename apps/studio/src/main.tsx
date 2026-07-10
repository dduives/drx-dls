import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// WebAwesome base stylesheet: supplies the default `--wa-*` token values
// (spacing, radii base, semantic light/dark color mapping) that our generated
// per-project theme only partially overrides. Defines defaults globally on
// `:root`; our palette overrides stay scoped under `[data-drx-preview]` and win
// for components inside the preview pane via inheritance.
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import "./index.css";
import App from "./App.tsx";
import { ProjectsProvider } from "./state/ProjectsProvider.tsx";
import { DeviceProvider } from "./state/DeviceProvider.tsx";

// WebAwesome custom elements are registered lazily inside the gallery chunk
// (see components/gallery/GalleryLazy.tsx) so their weight stays out of the
// initial bundle (DRI-68).

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProjectsProvider>
      <DeviceProvider>
        <App />
      </DeviceProvider>
    </ProjectsProvider>
  </StrictMode>,
);
