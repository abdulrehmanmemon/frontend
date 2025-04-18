import { forwardRef } from "react";

import { cn } from "@/helpers";

const Timeline = forwardRef(
  (
    {
      dataTheme,
      className,
      vertical,
      horizontal,
      responsive,
      snap,
      compact,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "timeline",
      {
        "timeline-vertical": vertical,
        "timeline-horizontal": horizontal,
        "timeline-vertical lg:timeline-horizontal": responsive,
        "timeline-snap-icon": snap,
        "timeline-compact": compact,
      },
      className
    );

    return (
      <ul {...props} data-theme={dataTheme} className={classes} ref={ref}>
        {children}
      </ul>
    );
  }
);

Timeline.displayName = "Timeline";

export default Timeline;
