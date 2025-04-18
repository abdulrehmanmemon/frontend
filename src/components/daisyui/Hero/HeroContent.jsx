import { forwardRef } from "react";

import { cn } from "@/helpers";

const HeroContent = forwardRef(
  ({ dataTheme, className, children, ...props }, ref) => {
    const classes = cn("hero-content", className);

    return (
      <div {...props} data-theme={dataTheme} className={classes} ref={ref}>
        {children}
      </div>
    );
  }
);

HeroContent.displayName = "Hero Content";

export default HeroContent;
