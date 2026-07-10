import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// WebAwesome base stylesheet: supplies the default `--wa-*` token values
// (spacing, radii base, semantic light/dark color mapping) that our generated
// per-project theme only partially overrides. Defines defaults globally on
// `:root`; our palette overrides stay scoped under `[data-drx-preview]` and win
// for components inside the preview pane via inheritance.
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import { registerAll } from "@drx-dls/webawesome";
import "./index.css";
import App from "./App.tsx";
import { ProjectsProvider } from "./state/ProjectsProvider.tsx";
import { DeviceProvider } from "./state/DeviceProvider.tsx";

// Register every bundled WebAwesome custom element and swap the icon library to
// Phosphor. Side-effecting; must run once before the gallery first renders.
registerAll();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProjectsProvider>
      <DeviceProvider>
        <App />
      </DeviceProvider>
    </ProjectsProvider>
  </StrictMode>,
);
