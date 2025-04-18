import { forwardRef } from "react";

import { cn } from "@/helpers";

const MenuItem = forwardRef(({ className, disabled, ...props }, ref) => {
  const classes = cn(className, {
    disabled: disabled,
  });

  return <li className={classes} {...props} ref={ref} />;
});

MenuItem.displayName = "Menu Item";

export default MenuItem;
