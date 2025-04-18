import { forwardRef } from "react";

import { cn } from "@/helpers";

const Stack = forwardRef(
  ({ dataTheme, className, children, ...props }, ref) => {
    const classes = cn("stack", className);

    return (
      <div
        aria-label="Stack"
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

Stack.displayName = "Stack";

export default Stack;
