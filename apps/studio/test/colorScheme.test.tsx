import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ColorSchemeProvider } from "../src/state/ColorSchemeProvider.tsx";
import { useColorScheme } from "../src/state/useColorScheme.ts";

// DRI-91: the resolved scheme drives the `.wa-light`/`.wa-dark` class App
// stamps on the preview root, which is what makes WebAwesome recompute its
// semantic + scale layer from the scoped preview inputs. Here we assert the
// provider resolves `light`/`dark`/`auto` correctly; the class → recompute
// wiring is validated end-to-end in a real browser.

const wrapper = ({ children }: { children: ReactNode }) => (
  <ColorSchemeProvider>{children}</ColorSchemeProvider>
);

let prefersDark = false;

beforeEach(() => {
  prefersDark = false;
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.className = "";
});

describe("ColorSchemeProvider (DRI-91)", () => {
  it("resolves an explicit light scheme to resolvedDark=false", () => {
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    act(() => result.current.setScheme("light"));
    expect(result.current.scheme).toBe("light");
    expect(result.current.resolvedDark).toBe(false);
  });

  it("resolves an explicit dark scheme to resolvedDark=true", () => {
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    act(() => result.current.setScheme("dark"));
    expect(result.current.scheme).toBe("dark");
    expect(result.current.resolvedDark).toBe(true);
  });

  it("resolves auto against prefers-color-scheme", () => {
    prefersDark = true;
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    act(() => result.current.setScheme("auto"));
    expect(result.current.scheme).toBe("auto");
    expect(result.current.resolvedDark).toBe(true);
  });

  it("keeps WebAwesome's <html> class in sync with the chosen scheme", () => {
    const { result } = renderHook(() => useColorScheme(), { wrapper });
    act(() => result.current.setScheme("dark"));
    expect(document.documentElement.classList.contains("wa-dark")).toBe(true);
    act(() => result.current.setScheme("light"));
    expect(document.documentElement.classList.contains("wa-light")).toBe(true);
  });
});
