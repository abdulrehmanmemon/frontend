import { forwardRef } from "react";

import { cn } from "@/helpers";

const Skeleton = forwardRef(
  ({ dataTheme, className, children, ...props }, ref) => {
    const classes = cn("skeleton", className);

    return (
      <div {...props} data-theme={dataTheme} className={classes} ref={ref}>
        {children}
      </div>
    );
  }
);

Skeleton.displayName = "Skeleton";

export default Skeleton;
