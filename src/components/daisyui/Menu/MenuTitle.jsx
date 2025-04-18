import { forwardRef } from "react";

import { cn } from "@/helpers";

const MenuTitle = forwardRef(({ className, ...props }, ref) => {
  const classes = cn("menu-title", className);

  return <li {...props} className={classes} ref={ref} />;
});

MenuTitle.displayName = "Menu Title";

export default MenuTitle;
