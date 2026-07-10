/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Tailwind styles ONLY Studio's own chrome (control panel, top bar, layout).
  // The live-preview pane renders real WebAwesome <wa-*> components themed
  // entirely via --wa-* CSS vars from @drx-dls/tokens — never Tailwind classes.
  theme: {
    extend: {},
  },
  plugins: [],
};
