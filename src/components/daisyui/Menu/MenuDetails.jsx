import { forwardRef } from "react";

const MenuDetails = forwardRef(
  ({ className, label, open, children, ...props }, ref) => {
    return (
      <details {...props} open={open} className={className} ref={ref}>
        <summary>{label}</summary>
        <ul>{children}</ul>
      </details>
    );
  }
);

MenuDetails.displayName = "Menu Details";

export default MenuDetails;
