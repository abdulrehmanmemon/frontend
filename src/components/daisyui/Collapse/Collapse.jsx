import { forwardRef, useRef, useState } from "react";

import { cn } from "@/helpers";

export const classesFn = ({ className, icon, open }) =>
  cn("collapse", className, {
    "collapse-arrow": icon === "arrow",
    "collapse-plus": icon === "plus",
    "collapse-open": open === true,
    "collapse-close": open === false,
  });

const Collapse = forwardRef(
  (
    {
      children,
      checkbox,
      icon,
      open,
      dataTheme,
      className,
      onOpen,
      onClose,
      onToggle,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = useState(open);
    const checkboxRef = useRef(null);

    // Handle events for checkbox changes
    const handleCheckboxChange = () => {
      if (onToggle) {
        onToggle();
      }
      if (onOpen && checkboxRef.current?.checked) {
        onOpen();
      } else if (onClose && !checkboxRef.current?.checked) {
        onClose();
      }

      setIsChecked(checkboxRef.current?.checked);
    };

    // Handle blur events, specifically handling open/close for non checkbox types
    const handleBlur = (event) => {
      if (!checkbox && onToggle) onToggle();
      if (!checkbox && onClose) onClose();
      if (props.onBlur) props.onBlur(event);
    };

    // Handle focus events, specifically handling open/close for non checkbox types
    const handleFocus = (event) => {
      if (!checkbox && onToggle) onToggle();
      if (!checkbox && onOpen) onOpen();
      if (props.onFocus) props.onFocus(event);
    };

    return (
      <div
        aria-expanded={open}
        {...props}
        ref={ref}
        tabIndex={isChecked === true ? undefined : 0}
        data-theme={dataTheme}
        className={classesFn({ className, icon, open })}
        onBlur={handleBlur}
        onFocus={handleFocus}
      >
        {checkbox && (
          <input
            type="checkbox"
            tabIndex={isChecked === true ? 0 : undefined}
            className="peer"
            ref={checkboxRef}
            onChange={handleCheckboxChange}
          />
        )}
        {children}
      </div>
    );
  }
);

Collapse.displayName = "Collapse";

export default Collapse;
