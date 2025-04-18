import { forwardRef } from "react";

import { cn } from "@/helpers";

const Loading = forwardRef(
  (
    { size, variant = "spinner", color, dataTheme, className, style, ...props },
    ref
  ) => {
    const classes = cn("loading", className, {
      "loading-lg": size === "lg",
      "loading-md": size === "md",
      "loading-sm": size === "sm",
      "loading-xs": size === "xs",
      "loading-spinner": variant === "spinner",
      "loading-dots": variant === "dots",
      "loading-ring": variant === "ring",
      "loading-ball": variant === "ball",
      "loading-bars": variant === "bars",
      "loading-infinity": variant === "infinity",
      "text-primary": color === "primary",
      "text-secondary": color === "secondary",
      "text-accent": color === "accent",
      "text-info": color === "info",
      "text-success": color === "success",
      "text-warning": color === "warning",
      "text-error": color === "error",
      "text-ghost": color === "ghost",
    });

    return (
      <span
        {...props}
        ref={ref}
        data-theme={dataTheme}
        className={classes}
        style={style}
      />
    );
  }
);

Loading.displayName = "Loading";

export default Loading;
