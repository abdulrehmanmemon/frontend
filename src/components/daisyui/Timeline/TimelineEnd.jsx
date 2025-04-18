import { forwardRef } from "react";

import { cn } from "@/helpers";

const TimelineEnd = forwardRef(
  ({ children, className, box = true, ...props }, ref) => {
    const classes = cn(
      "timeline-end",
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

TimelineEnd.displayName = "TimelineEnd";
export default TimelineEnd;
