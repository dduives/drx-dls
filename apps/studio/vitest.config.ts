import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Studio unit tests (DRI-64). A jsdom environment gives the state/persistence
// tests a real `localStorage` and lets the gallery smoke test register + render
// WebAwesome custom elements (jsdom supports `customElements`). The same
// `@vitejs/plugin-react` used by the app compiles the `.tsx` component tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.{ts,tsx}"],
    // WebAwesome components are ESM-only; make sure they're transformed rather
    // than treated as externalized CommonJS.
    server: { deps: { inline: [/@awesome\.me\/webawesome/, /@drx-dls\//] } },
  },
});
