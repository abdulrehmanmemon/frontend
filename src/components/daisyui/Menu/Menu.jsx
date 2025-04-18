import { forwardRef } from "react";

import { cn } from "@/helpers";

const Menu = forwardRef(
  (
    { responsive, horizontal, vertical, dataTheme, className, size, ...props },
    ref
  ) => {
    const classes = cn("menu", className, {
      "menu-vertical lg:menu-horizontal": responsive,
      "menu-lg": size === "lg",
      "menu-md": size === "md",
      "menu-sm": size === "sm",
      "menu-xs": size === "xs",
      "menu-vertical": vertical,
      "menu-horizontal": horizontal,
    });

    return (
      <ul data-theme={dataTheme} className={classes} {...props} ref={ref} />
    );
  }
);

Menu.displayName = "Menu";

export default Menu;
