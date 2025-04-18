import { forwardRef } from "react";

import { cn } from "@/helpers";

const Range = forwardRef(
  (
    {
      color,
      size,
      step,
      displayTicks,
      ticksStep,
      dataTheme,
      className,
      ...props
    },
    ref
  ) => {
    const classes = cn("range", className, {
      "range-lg": size === "lg",
      "range-md": size === "md",
      "range-sm": size === "sm",
      "range-xs": size === "xs",
      "range-primary": color === "primary",
      "range-secondary": color === "secondary",
      "range-accent": color === "accent",
      "range-info": color === "info",
      "range-success": color === "success",
      "range-warning": color === "warning",
      "range-error": color === "error",
    });

    const calculatedDisplayTicks = displayTicks ?? step !== undefined;
    const calculatedStep = step !== undefined ? Number(step) : 1; // default value per HTML standard
    const calculatedTicksStep = ticksStep ?? calculatedStep;
    const min = props.min !== undefined ? Number(props.min) : 0; // default value per HTML standard
    const max = props.max !== undefined ? Number(props.max) : 100; // default value per HTML standard

    // use Math.max to solve multiple issues with negative numbers throwing errors
    const numTicks =
      Math.max(Math.ceil((max - min) / calculatedTicksStep), 1) + 1;

    return (
      <>
        <input
          {...props}
          ref={ref}
          type="range"
          step={step}
          data-theme={dataTheme}
          className={classes}
        />
        {calculatedDisplayTicks && (
          <div className="flex w-full justify-between px-2 text-xs">
            {[...Array(numTicks)].map((_, i) => {
              return <span key={i}>|</span>;
            })}
          </div>
        )}
      </>
    );
  }
);

Range.displayName = "Range";

export default Range;
