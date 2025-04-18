import { forwardRef } from "react";

import { classesFn } from "./Dropdown";

const DropdownDetails = forwardRef(
  (
    {
      children,
      className,
      horizontal,
      vertical,
      end,
      dataTheme,
      open,
      ...props
    },
    ref
  ) => {
    return (
      <details
        role="listbox"
        {...props}
        ref={ref}
        data-theme={dataTheme}
        className={classesFn({
          className,
          horizontal,
          vertical,
          open,
          end,
        })}
        open={open}
      >
        {children}
      </details>
    );
  }
);

DropdownDetails.displayName = "Dropdown Details";

export default DropdownDetails;
