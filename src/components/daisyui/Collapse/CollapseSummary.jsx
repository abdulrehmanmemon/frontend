import { forwardRef } from "react";

import { cn } from "@/helpers";

const classesFn = ({ className }) => cn("collapse-title", className);

export const CollapseSummary = forwardRef(({ children, className }, ref) => {
  return (
    <summary ref={ref} className={classesFn({ className })}>
      {children}
    </summary>
  );
});

CollapseSummary.displayName = "Collapse Summary";

export default CollapseSummary;
