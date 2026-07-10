import type { Preview } from "@storybook/react";
import "../src/styles.css";
// Generated default theme (drx-theme build). Regenerate via the tokens CLI.
import "./theme.css";

/** Toolbar controls to swap appearance + device — proves theming is data-only. */
const preview: Preview = {
  globalTypes: {
    mode: {
      description: "Appearance",
      defaultValue: "dark",
      toolbar: {
        title: "Mode",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
    device: {
      description: "Device",
      defaultValue: "web",
      toolbar: {
        title: "Device",
        icon: "browser",
        items: [
          { value: "web", title: "Web" },
          { value: "ios", title: "iOS" },
          { value: "tvos", title: "tvOS" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { mode, device } = context.globals;
      const root = document.documentElement;
      root.setAttribute("data-mode", mode);
      root.setAttribute("data-device", device);
      document.body.style.background = "var(--color-bg)";
      document.body.style.color = "var(--color-fg)";
      return Story();
    },
  ],
  parameters: {
    layout: "centered",
    controls: { expanded: true },
  },
};

export default preview;
