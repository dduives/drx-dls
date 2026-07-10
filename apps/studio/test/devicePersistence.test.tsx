import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { DeviceProvider } from "../src/state/DeviceProvider.tsx";
import { useDevice } from "../src/state/useDevice.ts";
import { ACTIVE_DEVICE_KEY, readString, writeString } from "../src/lib/storage.ts";

const wrapper = ({ children }: { children: ReactNode }) => (
  <DeviceProvider>{children}</DeviceProvider>
);

const render = () => renderHook(() => useDevice(), { wrapper });

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

describe("active-device persistence (DRI-67)", () => {
  it("defaults to 'web' on first run", () => {
    const { result } = render();
    expect(result.current.device).toBe("web");
  });

  it("writes the selection back to localStorage on change", () => {
    const { result } = render();
    act(() => {
      result.current.setDevice("ios");
    });
    expect(result.current.device).toBe("ios");
    expect(readString(ACTIVE_DEVICE_KEY)).toBe("ios");
  });

  it("restores the persisted device across a reload", () => {
    const first = render();
    act(() => {
      first.result.current.setDevice("tvos");
    });
    // Unmount = close the tab; only localStorage remains.
    first.unmount();

    const second = render();
    expect(second.result.current.device).toBe("tvos");
  });

  it("falls back to 'web' when the stored value is invalid", () => {
    writeString(ACTIVE_DEVICE_KEY, "watch");
    const { result } = render();
    expect(result.current.device).toBe("web");
  });
});
