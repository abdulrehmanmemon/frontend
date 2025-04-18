import { forwardRef } from "react";

import { cn } from "@/helpers";

const BottomNavigationLabel = forwardRef(
  ({ children, className, ...props }, ref) => {
    const classes = cn("btm-nav-label", className);
    return (
      <span {...props} className={classes} ref={ref}>
        {children}
      </span>
    );
  }
);

BottomNavigationLabel.displayName = "Bottom Navigation Label";

export default BottomNavigationLabel;
