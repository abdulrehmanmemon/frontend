import { forwardRef } from "react";

import { cn } from "@/helpers";

const Diff = forwardRef(
  ({ dataTheme, className, children, secondItem, ...props }, ref) => {
    const classes = cn("diff aspect-[16/9]", className);

    return (
      <div {...props} data-theme={dataTheme} className={classes} ref={ref}>
        <div className="diff-item-1">{children}</div>
        <div className="diff-item-2">{secondItem}</div>
        <div className="diff-resizer" />
      </div>
    );
  }
);

Diff.displayName = "Diff";

export default Diff;
