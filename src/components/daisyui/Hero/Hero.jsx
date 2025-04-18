import { forwardRef } from "react";

import { cn } from "@/helpers";

const Hero = forwardRef(({ dataTheme, className, children, ...props }, ref) => {
  const classes = cn("hero", className);

  return (
    <div
      role="banner"
      {...props}
      data-theme={dataTheme}
      className={classes}
      ref={ref}
    >
      {children}
    </div>
  );
});

Hero.displayName = "Hero";

export default Hero;
