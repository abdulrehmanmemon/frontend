import { forwardRef } from "react";

import { cn } from "@/helpers";

const StatSection = forwardRef(
  ({ children, section, className, ...props }, ref) => {
    const classes = cn(className, {
      "stat-title": section === "title",
      "stat-value": section === "value",
      "stat-desc": section === "desc",
      "stat-figure": section === "figure",
      "stat-actions": section === "actions",
    });

    return (
      <div {...props} className={classes} ref={ref}>
        {children}
      </div>
    );
  }
);

StatSection.displayName = "Stat Section";

export default StatSection;
