import { useContext } from "react";
import { ThemeInputsContext, type ThemeInputsContextValue } from "./context";

export function useThemeInputs(): ThemeInputsContextValue {
  const ctx = useContext(ThemeInputsContext);
  if (!ctx) {
    throw new Error(
      "useThemeInputs must be used within a <ThemeInputsProvider>",
    );
  }
  return ctx;
}
