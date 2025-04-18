import { forwardRef } from "react";

import { cn } from "@/helpers";

const Accordion = forwardRef(
  (
    { name = "accordion", icon, dataTheme, className, children, ...props },
    ref
  ) => {
    const classes = cn(
      "collapse",
      {
        "collapse-arrow": icon === "arrow",
        "collapse-plus": icon === "plus",
      },
      className
    );

    return (
      <div data-theme={dataTheme} className={classes}>
        <input
          {...props}
          ref={ref}
          type="radio"
          aria-label="Accordion radio"
          name={name}
        />
        {children}
      </div>
    );
  }
);

Accordion.displayName = "Accordion";

export default Accordion;
