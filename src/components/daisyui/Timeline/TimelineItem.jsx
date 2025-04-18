import { forwardRef } from "react";

const TimelineItem = forwardRef(
  (
    { children, className, connect, startClassName, endClassName, ...props },
    ref
  ) => {
    return (
      <li {...props} className={className} ref={ref}>
        {(connect === "both" || connect === "start") && (
          <hr className={startClassName} />
        )}
        {children}
        {(connect === "both" || connect === "end") && (
          <hr className={endClassName} />
        )}
      </li>
    );
  }
);

TimelineItem.displayName = "TimelineItem";
export default TimelineItem;
