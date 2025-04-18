import { forwardRef } from "react";

import { cn } from "@/helpers";

const Stats = forwardRef(
  (
    { direction = "horizontal", dataTheme, className, children, ...props },
    ref
  ) => {
    const classes = cn("stats", className, {
      "stats-vertical": direction === "vertical",
      "stats-horizontal": direction === "horizontal",
    });

    return (
      <div {...props} ref={ref} data-theme={dataTheme} className={classes}>
        {children}
      </div>
    );
  }
);

Stats.displayName = "Stats";

export default Stats;
