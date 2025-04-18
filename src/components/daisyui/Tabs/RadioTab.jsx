import { forwardRef } from "react";

import { cn } from "@/helpers";

const RadioTab = forwardRef(
  (
    {
      children,
      className,
      active,
      label,
      disabled,
      name,
      contentClassName,
      ...props
    },
    ref
  ) => {
    const classes = cn("tab", className, {
      "tab-active": active,
      "tab-disabled": disabled,
    });
    const contentClasses = cn("tab-content", contentClassName);

    return (
      <>
        <input
          className={classes}
          role="tab"
          type="radio"
          name={name}
          disabled={disabled}
          aria-label={label}
          {...props}
          ref={ref}
        />
        <div className={contentClasses}>{children}</div>
      </>
    );
  }
);

RadioTab.displayName = "Radio Tab";

export default RadioTab;
