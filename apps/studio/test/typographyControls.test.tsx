import { act, render, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { ProjectsProvider } from "../src/state/ProjectsProvider.tsx";
import { TypographyControls } from "../src/components/controls/TypographyControls.tsx";

const INTER = "'Inter', ui-sans-serif, system-ui, sans-serif";
const SYSTEM_UI =
  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const PACIFICO_STACK = "'Pacifico', sans-serif";
const PACIFICO_URL =
  "https://fonts.googleapis.com/css2?family=Pacifico&display=swap";
const LOBSTER_URL =
  "https://fonts.googleapis.com/css2?family=Lobster&display=swap";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ProjectsProvider>{children}</ProjectsProvider>
);

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

function setup() {
  const utils = render(<TypographyControls />, { wrapper });
  const sel = (kind: string) =>
    utils.container.querySelector<HTMLSelectElement>(`#ff-${kind}`)!;
  const urlInput = () =>
    utils.container.querySelector<HTMLInputElement>(
      'input[aria-label="Custom font Google Fonts URL"]',
    )!;
  const loadBtn = () =>
    Array.from(utils.container.querySelectorAll("button")).find(
      (b) => b.textContent === "Load font",
    )!;
  const removeBtn = () =>
    Array.from(utils.container.querySelectorAll("button")).find(
      (b) => b.textContent === "Remove",
    );
  const loadFont = (url: string) => {
    act(() => {
      fireEvent.change(urlInput(), { target: { value: url } });
    });
    act(() => {
      fireEvent.click(loadBtn());
    });
  };
  const optionLabels = (kind: string) =>
    Array.from(sel(kind).options).map((o) => o.label);
  return { ...utils, sel, urlInput, loadBtn, removeBtn, loadFont, optionLabels };
}

describe("TypographyControls custom font (DRI-108 follow-up)", () => {
  it("uses one shared custom-font control, no per-slot 'Custom…' option", () => {
    const { optionLabels, urlInput } = setup();
    for (const kind of ["heading", "body", "code"]) {
      expect(optionLabels(kind)).not.toContain("Custom…");
    }
    expect(urlInput()).toBeTruthy();
  });

  it("a loaded family becomes selectable in every slot", () => {
    const { loadFont, optionLabels } = setup();
    loadFont(PACIFICO_URL);
    for (const kind of ["heading", "body", "code"]) {
      expect(optionLabels(kind)).toContain("Pacifico");
    }
  });

  it("assigning the custom font to one slot leaves the others untouched", () => {
    const { loadFont, sel } = setup();
    loadFont(PACIFICO_URL);
    act(() => {
      fireEvent.change(sel("heading"), { target: { value: PACIFICO_STACK } });
    });
    expect(sel("heading").value).toBe(PACIFICO_STACK);
    // Body keeps its default — the custom font does not take over every slot.
    expect(sel("body").value).toBe(SYSTEM_UI);
  });

  it("a slot on the custom font can be switched back to a default", () => {
    const { loadFont, sel } = setup();
    loadFont(PACIFICO_URL);
    act(() => {
      fireEvent.change(sel("body"), { target: { value: PACIFICO_STACK } });
    });
    expect(sel("body").value).toBe(PACIFICO_STACK);
    act(() => {
      fireEvent.change(sel("body"), { target: { value: INTER } });
    });
    expect(sel("body").value).toBe(INTER);
  });

  it("replacing the custom font resets slots still using the old family", () => {
    const { loadFont, sel, optionLabels } = setup();
    loadFont(PACIFICO_URL);
    act(() => {
      fireEvent.change(sel("heading"), { target: { value: PACIFICO_STACK } });
    });
    expect(sel("heading").value).toBe(PACIFICO_STACK);
    // Load a different font — Pacifico is no longer available.
    loadFont(LOBSTER_URL);
    expect(optionLabels("heading")).toContain("Lobster");
    expect(optionLabels("heading")).not.toContain("Pacifico");
    // The heading slot fell back to its default rather than dangling.
    expect(sel("heading").value).toBe(SYSTEM_UI);
  });

  it("removing the custom font clears it and resets slots that used it", () => {
    const { loadFont, sel, removeBtn, optionLabels } = setup();
    loadFont(PACIFICO_URL);
    act(() => {
      fireEvent.change(sel("body"), { target: { value: PACIFICO_STACK } });
    });
    act(() => {
      fireEvent.click(removeBtn()!);
    });
    expect(sel("body").value).toBe(SYSTEM_UI);
    for (const kind of ["heading", "body", "code"]) {
      expect(optionLabels(kind)).not.toContain("Pacifico");
    }
  });
});
