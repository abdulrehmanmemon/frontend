import { forwardRef } from "react";

import { cn } from "@/helpers";

const Kbd = forwardRef(
  ({ children, size, dataTheme, className, ...props }, ref) => {
    const classes = cn("kbd", className, {
      "kbd-lg": size === "lg",
      "kbd-md": size === "md",
      "kbd-sm": size === "sm",
      "kbd-xs": size === "xs",
    });

    return (
      <kbd {...props} data-theme={dataTheme} className={classes} ref={ref}>
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = "Kbd";

export default Kbd;
