import { forwardRef } from "react";

import { cn } from "@/helpers";

import NavbarSection from "./NavbarSection";

const Navbar = forwardRef(
  ({ children, dataTheme, className, ...props }, ref) => {
    const classes = cn("navbar", className);

    return (
      <div
        role="navigation"
        aria-label="Navbar"
        {...props}
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

const NavbarStart = forwardRef((props, ref) => (
  <NavbarSection {...props} section="start" ref={ref} />
));

const NavbarCenter = forwardRef((props, ref) => (
  <NavbarSection {...props} section="center" ref={ref} />
));

const NavbarEnd = forwardRef((props, ref) => (
  <NavbarSection {...props} section="end" ref={ref} />
));

Navbar.displayName = "Navbar";
NavbarStart.displayName = "Navbar Start";
NavbarCenter.displayName = "Navbar Center";
NavbarEnd.displayName = "Navbar End";

export default Navbar;

export { NavbarStart, NavbarCenter, NavbarEnd };
