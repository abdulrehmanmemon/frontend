import { forwardRef } from "react";

import { cn } from "@/helpers";

const Tabs = forwardRef(({ children, className, variant, size }, ref) => {
  const classes = cn("tabs", className, {
    "tabs-boxed": variant === "boxed",
    "tabs-bordered": variant === "bordered",
    "tabs-lifted": variant === "lifted",
    "tabs-lg": size === "lg",
    "tabs-md": size === "md",
    "tabs-sm": size === "sm",
    "tabs-xs": size === "xs",
  });

  return (
    <div role="tablist" className={classes} ref={ref}>
      {children}
    </div>
  );
});

Tabs.displayName = "Tabs";

export default Tabs;
