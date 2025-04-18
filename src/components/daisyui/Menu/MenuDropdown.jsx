import { forwardRef } from "react";

import { cn } from "@/helpers";

const MenuDropdown = forwardRef(
  ({ className, label, open, children, ...props }, ref) => {
    const classes = cn("menu-dropdown-toggle", className, {
      "menu-dropdown-show": open,
    });

    return (
      <>
        <span {...props} className={classes} ref={ref}>
          {label}
        </span>
        <ul className={cn("menu-dropdown", { "menu-dropdown-show": open })}>
          {children}
        </ul>
      </>
    );
  }
);

MenuDropdown.displayName = "Menu Dropdown";

export default MenuDropdown;
