import { forwardRef } from "react";

import { cn } from "@/helpers";

const HeroOverlay = forwardRef(
  ({ dataTheme, className, children, ...props }, ref) => {
    const classes = cn("hero-overlay", className);

    return (
      <div {...props} data-theme={dataTheme} className={classes} ref={ref}>
        {children}
      </div>
    );
  }
);

HeroOverlay.displayName = "Hero Overlay";

export default HeroOverlay;
