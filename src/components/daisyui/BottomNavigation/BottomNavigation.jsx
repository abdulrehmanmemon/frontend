import { forwardRef } from "react";

import { cn } from "@/helpers";

const BottomNavigation = forwardRef(
  ({ size, dataTheme, className, children, ...props }, ref) => {
    const classes = cn(
      "btm-nav",
      {
        "btm-nav-lg": size === "lg",
        "btm-nav-md": size === "md",
        "btm-nav-sm": size === "sm",
        "btm-nav-xs": size === "xs",
      },
      className
    );

    return (
      <div
        {...props}
        role="navigation"
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

BottomNavigation.displayName = "BottomNavigation";

export default BottomNavigation;
