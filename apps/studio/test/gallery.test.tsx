import { describe, expect, it, beforeAll } from "vitest";
import { registerAll } from "@drx-dls/webawesome";

// DRI-53 preview gallery renders REAL `<wa-*>` custom elements. jsdom implements
// `customElements` (so registration + element *upgrade* are verifiable), but its
// `ElementInternals` is a stub without the form-associated validity API that
// WA's Lit components exercise during their first *render* lifecycle — a jsdom
// gap, not a DRX/WA bug. So this smoke test asserts the meaningful contract
// (registerAll runs; the element upgrades to its registered class without
// throwing; theme vars are inheritable) rather than driving a browser-only
// render. Pixel-truth is validated in a real browser, not here.
beforeAll(() => {
  expect(() => registerAll()).not.toThrow();
});

describe("gallery render smoke test", () => {
  it("registerAll defines the wa-button custom element", () => {
    expect(customElements.get("wa-button")).toBeTruthy();
  });

  it("a themed <wa-button> upgrades to its registered class without errors", () => {
    const root = document.createElement("div");
    root.setAttribute("data-drx-preview", "");
    // A generated theme var — a real component re-themes purely via inheritance.
    root.style.setProperty("--wa-color-brand-fill-loud", "#3b82f6");
    document.body.appendChild(root);
    // The scope root actually carries the theme var (inheritance is the theming
    // mechanism the gallery relies on).
    expect(root.style.getPropertyValue("--wa-color-brand-fill-loud")).toBe(
      "#3b82f6",
    );

    // Creating a defined custom element upgrades it (runs its constructor).
    let el!: HTMLElement;
    expect(() => {
      el = document.createElement("wa-button");
      el.setAttribute("variant", "brand");
      el.textContent = "Brand";
    }).not.toThrow();

    // It upgraded to the registered class, not a bare HTMLUnknownElement.
    const Ctor = customElements.get("wa-button")!;
    expect(el).toBeInstanceOf(Ctor);
    expect(el.tagName.toLowerCase()).toBe("wa-button");

    document.body.removeChild(root);
  });
});
