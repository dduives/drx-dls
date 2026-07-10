// Lazy entrypoint for the component gallery (DRI-68 code-splitting).
//
// Importing this module pulls in `@drx-dls/webawesome` — whose `register.ts`
// side-effect-imports every bundled WebAwesome custom element — plus the full
// gallery tree. Loading it through a dynamic `import()` (see `App.tsx`) keeps
// all of that WA/Lit weight out of the initial app chunk; it is fetched only
// when the preview pane first mounts. Registration runs here (module top level)
// so every `<wa-*>` element is defined before the gallery renders.
import { registerAll } from "@drx-dls/webawesome/register";
import { Gallery } from "./Gallery.tsx";

registerAll();

export default Gallery;
