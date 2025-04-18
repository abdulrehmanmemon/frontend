import { forwardRef } from "react";

import { cn } from "@/helpers";

const Alert = forwardRef(
  ({ children, icon, status, dataTheme, className, ...props }, ref) => {
    const classes = cn("alert", className, {
      "alert-info": status === "info",
      "alert-success": status === "success",
      "alert-warning": status === "warning",
      "alert-error": status === "error",
    });

    return (
      <div
        role="alert"
        {...props}
        ref={ref}
        data-theme={dataTheme}
        className={classes}
      >
        {icon}
        {children}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export default Alert;
