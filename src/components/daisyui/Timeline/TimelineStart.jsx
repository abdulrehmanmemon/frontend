import { forwardRef } from "react";

import { cn } from "@/helpers";

const TimelineStart = forwardRef(
  ({ children, className, box, ...props }, ref) => {
    const classes = cn(
      "timeline-start",
      {
        "timeline-box": box,
      },
      className
    );
    return (
      <div {...props} className={classes} ref={ref}>
        {children}
      </div>
    );
  }
);

TimelineStart.displayName = "TimelineStart";
export default TimelineStart;
