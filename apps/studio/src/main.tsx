import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeInputsProvider } from "./state/ThemeInputsProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeInputsProvider>
      <App />
    </ThemeInputsProvider>
  </StrictMode>,
);
