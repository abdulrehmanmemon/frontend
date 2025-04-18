import { forwardRef } from "react";

import { cn } from "@/helpers";

const classesFn = ({ className } = {}) => cn("indicator", className);

const Indicator = forwardRef(
  ({ children, className, dataTheme, ...props }, ref) => {
    return (
      <div
        {...props}
        data-theme={dataTheme}
        className={classesFn({ className })}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

export default Object.assign(Indicator, {
  className: classesFn,
});

Indicator.displayName = "Indicator";
