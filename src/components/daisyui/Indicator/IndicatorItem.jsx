import { forwardRef } from "react";

import { cn } from "@/helpers";

const classesFn = ({ className, horizontal, vertical } = {}) =>
  cn("indicator-item", className, {
    "indicator-start": horizontal === "start",
    "indicator-center": horizontal === "center",
    "indicator-end": horizontal === "end",
    "indicator-top": vertical === "top",
    "indicator-middle": vertical === "middle",
    "indicator-bottom": vertical === "bottom",
  });

const IndicatorItem = forwardRef(
  (
    {
      children,
      horizontal = "end",
      vertical = "top",
      dataTheme,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        aria-label="Indicator"
        {...props}
        className={classesFn({ className, horizontal, vertical })}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);
IndicatorItem.displayName = "Indicator Item";

export default Object.assign(IndicatorItem, { className: classesFn });
