import { forwardRef } from "react";

import { cn } from "@/helpers";

const Radio = forwardRef(
  ({ color, size, name, dataTheme, className, ...props }, ref) => {
    const classes = cn("radio", className, {
      "radio-lg": size === "lg",
      "radio-md": size === "md",
      "radio-sm": size === "sm",
      "radio-xs": size === "xs",
      "radio-primary": color === "primary",
      "radio-secondary": color === "secondary",
      "radio-accent": color === "accent",
      "radio-info": color === "info",
      "radio-success": color === "success",
      "radio-warning": color === "warning",
      "radio-error": color === "error",
    });

    return (
      <input
        {...props}
        ref={ref}
        type="radio"
        name={name}
        data-theme={dataTheme}
        className={classes}
      />
    );
  }
);

Radio.displayName = "Radio";

export default Radio;
