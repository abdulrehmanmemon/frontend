import { forwardRef } from "react";

import { cn } from "@/helpers";

const Breadcrumbs = forwardRef(
  ({ children, dataTheme, className, innerProps, innerRef, ...props }, ref) => {
    const classes = cn("breadcrumbs", "text-sm", className);

    return (
      <div
        aria-label="Breadcrumbs"
        {...props}
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        <ul {...innerProps} ref={innerRef}>
          {children}
        </ul>
      </div>
    );
  }
);

Breadcrumbs.displayName = "Breadcrumbs";

export default Breadcrumbs;
