import { Children, cloneElement, forwardRef } from "react";

import { cn } from "@/helpers";

const CodeMockup = forwardRef(
  ({ dataTheme, className, children, ...props }, ref) => {
    const classes = cn("mockup-code", className);

    return (
      <div
        aria-label="Code mockup"
        {...props}
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        {Children.map(children, (child, index) => {
          const childComponent = child;
          return cloneElement(childComponent, {
            key: index,
          });
        })}
      </div>
    );
  }
);

CodeMockup.displayName = "CodeMockup";

export default CodeMockup;
