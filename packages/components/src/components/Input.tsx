import * as React from "react";
import { cn } from "../lib/cn.js";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-10 w-full rounded-control border border-border bg-bg px-3 text-sm text-fg",
      "placeholder:text-muted",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
