import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/register.ts",
    "src/theme.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    "@awesome.me/webawesome",
    "@drx-dls/tokens",
  ],
});
