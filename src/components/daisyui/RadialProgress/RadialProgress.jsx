import { forwardRef } from "react";

import { cn } from "@/helpers";

const RadialProgress = forwardRef(
  (
    {
      value,
      size = "4rem",
      thickness = "4px",
      color,
      dataTheme,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn("radial-progress", className, {
      "text-primary": color === "primary",
      "text-secondary": color === "secondary",
      "text-accent": color === "accent",
      "text-info": color === "info",
      "text-success": color === "success",
      "text-warning": color === "warning",
      "text-error": color === "error",
    });

    const displayedValue = Math.min(100, Math.max(0, value));
    const progressStyle = {
      "--value": displayedValue,
      "--size": size,
      "--thickness": thickness,
    };

    return (
      <div
        role="progressbar"
        aria-valuenow={displayedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
        ref={ref}
        data-theme={dataTheme}
        className={classes}
        style={progressStyle}
      >
        {children}
      </div>
    );
  }
);

RadialProgress.displayName = "RadialProgress";

export default RadialProgress;
