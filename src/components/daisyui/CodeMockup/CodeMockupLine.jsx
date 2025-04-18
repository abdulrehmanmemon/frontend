import { forwardRef } from "react";

import { cn } from "@/helpers";

export const CodeMockupLine = forwardRef(
  (
    {
      dataPrefix,
      dataTheme,
      status,
      className,
      children,
      innerProps,
      innerRef,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      {
        "bg-info": status === "info",
        "bg-success": status === "success",
        "bg-warning": status === "warning",
        "bg-error": status === "error",
        "text-info-content": status === "info",
        "text-success-content": status === "success",
        "text-warning-content": status === "warning",
        "text-error-content": status === "error",
      },
      className
    );

    const allProps = {
      ...props,
      className: classes,
      ...(dataPrefix !== false && { "data-prefix": dataPrefix || ">" }),
    };

    return (
      <pre {...allProps} data-theme={dataTheme} className={classes} ref={ref}>
        <code {...innerProps} ref={innerRef}>
          {children}
        </code>
      </pre>
    );
  }
);

CodeMockupLine.displayName = "Code Mockup Line";

export default CodeMockupLine;
