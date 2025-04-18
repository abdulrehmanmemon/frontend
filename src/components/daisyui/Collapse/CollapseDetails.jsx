import { forwardRef } from "react";

import { classesFn } from "./Collapse";

const CollapseDetails = forwardRef(
  ({ children, icon, open, dataTheme, className, ...props }, ref) => {
    return (
      <details
        {...props}
        ref={ref}
        data-theme={dataTheme}
        className={classesFn({ className, icon, open })}
        open={open}
      >
        {children}
      </details>
    );
  }
);

CollapseDetails.displayName = "Collapse Details";

export default CollapseDetails;
