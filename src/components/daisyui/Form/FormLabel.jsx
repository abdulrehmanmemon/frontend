import { forwardRef } from "react";

import { cn } from "@/helpers";

const FormLabel = forwardRef(
  ({ children, title, dataTheme, hidden, className, ...props }, ref) => {
    const classes = cn(
      "label",
      {
        hidden: hidden,
      },
      className
    );

    return (
      <label {...props} className={classes}>
        <span className="label-text cursor-pointer" ref={ref}>
          {title}
        </span>
        {children}
      </label>
    );
  }
);

FormLabel.displayName = "Form Label";

export default FormLabel;
