import { forwardRef } from "react";

import { cn } from "@/helpers";

const Steps = forwardRef(
  ({ children, dataTheme, className, vertical, horizontal, ...props }, ref) => {
    const classes = cn("steps", className, {
      "steps-vertical": vertical,
      "steps-horizontal": horizontal,
    });

    return (
      <ul
        aria-label="Steps"
        role="group"
        {...props}
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        {children}
      </ul>
    );
  }
);

Steps.displayName = "Steps";
export default Steps;
