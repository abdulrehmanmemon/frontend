import { forwardRef } from "react";

import { cn } from "@/helpers";

const SelectInner = (props, ref) => {
  const {
    children,
    size,
    color,
    bordered = true,
    borderOffset,
    dataTheme,
    className,
    ...rest
  } = props;

  const classes = cn("select", className, {
    "select-lg": size === "lg",
    "select-md": size === "md",
    "select-sm": size === "sm",
    "select-xs": size === "xs",
    "select-primary": color === "primary",
    "select-secondary": color === "secondary",
    "select-accent": color === "accent",
    "select-ghost": color === "ghost",
    "select-info": color === "info",
    "select-success": color === "success",
    "select-warning": color === "warning",
    "select-error": color === "error",
    "select-bordered": bordered,
    "focus:outline-offset-0": !borderOffset,
  });

  return (
    <select {...rest} ref={ref} data-theme={dataTheme} className={classes}>
      {children}
    </select>
  );
};

const Select = forwardRef(SelectInner);
export default Select;
