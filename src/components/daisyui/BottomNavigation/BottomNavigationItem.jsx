import { forwardRef } from "react";

import { cn } from "@/helpers";

const BottomNavigationItem = forwardRef(
  (
    { children, className, color, dataTheme, active, disabled, ...props },
    ref
  ) => {
    const classes = cn(className, {
      "text-neutral": color === "neutral",
      "text-primary": color === "primary",
      "text-secondary": color === "secondary",
      "text-accent": color === "accent",
      "text-info": color === "info",
      "text-success": color === "success",
      "text-warning": color === "warning",
      "text-error": color === "error",
      active: active,
      disabled: disabled,
    });
    return (
      <button {...props} className={classes} data-theme={dataTheme} ref={ref}>
        {children}
      </button>
    );
  }
);

BottomNavigationItem.displayName = "Bottom Navigation Item";

export default BottomNavigationItem;
