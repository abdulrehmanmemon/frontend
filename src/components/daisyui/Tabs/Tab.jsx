import { forwardRef } from "react";

import { cn } from "@/helpers";

const Tab = forwardRef(
  ({ children, className, active, disabled, ...props }, ref) => {
    const classes = cn("tab", className, {
      "tab-active": active,
      "tab-disabled": disabled,
    });
    return (
      <a role="tab" {...props} ref={ref} className={classes}>
        {children}
      </a>
    );
  }
);

Tab.displayName = "Tab";

export default Tab;
