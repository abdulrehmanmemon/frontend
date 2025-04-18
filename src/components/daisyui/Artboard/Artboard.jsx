import { forwardRef } from "react";

import { cn } from "@/helpers";

const Artboard = forwardRef(
  (
    { children, demo = true, size, horizontal, dataTheme, className, ...props },
    ref
  ) => {
    const classes = cn("artboard", className, {
      "artboard-demo": demo,
      "phone-1": size === 1,
      "phone-2": size === 2,
      "phone-3": size === 3,
      "phone-4": size === 4,
      "phone-5": size === 5,
      "phone-6": size === 6,
      horizontal: horizontal,
    });

    return (
      <div
        aria-label="Artboard"
        {...props}
        ref={ref}
        data-theme={dataTheme}
        className={classes}
      >
        {children}
      </div>
    );
  }
);

Artboard.displayName = "Artboard";

export default Artboard;
