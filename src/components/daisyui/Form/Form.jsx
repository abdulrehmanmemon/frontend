import { forwardRef } from "react";

import { cn } from "@/helpers";

const Form = forwardRef(({ children, dataTheme, className, ...props }, ref) => {
  const classes = cn("form-control", className);

  return (
    <form
      role="form"
      {...props}
      data-theme={dataTheme}
      className={classes}
      ref={ref}
    >
      {children}
    </form>
  );
});

Form.displayName = "Form";

export default Form;
