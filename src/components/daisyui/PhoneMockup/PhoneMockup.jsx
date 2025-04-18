import { forwardRef } from "react";

import { cn } from "@/helpers";

const PhoneMockup = forwardRef(
  (
    { color, dataTheme, className, children, innerRef, innerProps, ...props },
    ref
  ) => {
    const classes = cn(
      "mockup-phone",
      {
        "border-primary": color === "primary",
        "border-secondary": color === "secondary",
        "border-info": color === "info",
        "border-success": color === "success",
        "border-warning": color === "warning",
        "border-error": color === "error",
      },
      className
    );

    return (
      <div
        aria-label="Phone mockup"
        {...props}
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        <div className="camera" />
        <div className="display">
          <div
            {...innerProps}
            className={cn(
              "artboard artboard-demo phone-1",
              innerProps?.className
            )}
            ref={innerRef}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);

PhoneMockup.displayName = "PhoneMockup";

export default PhoneMockup;
