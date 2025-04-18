import { forwardRef } from "react";

import { cn } from "@/helpers";

import { Loading } from "../Loading";

//  https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const VoidElementList = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "keygen",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];
const Button = forwardRef(
  (
    {
      children,
      shape,
      size,
      variant,
      color,
      glass,
      startIcon,
      endIcon,
      wide,
      fullWidth,
      responsive,
      animation = true,
      loading,
      active,
      disabled,
      dataTheme,
      className,
      style,
      tag = "button",
      ...props
    },
    ref
  ) => {
    const Tag = tag;
    const classes = cn("btn", className, {
      "gap-2": (startIcon && !loading) || endIcon,
      "btn-lg": size === "lg",
      "btn-md": size === "md",
      "btn-sm": size === "sm",
      "btn-xs": size === "xs",
      "btn-circle": shape === "circle",
      "btn-square": shape === "square",
      "btn-outline": variant === "outline",
      "btn-link": variant === "link",
      "btn-neutral": color === "neutral",
      "btn-primary": color === "primary",
      "btn-secondary": color === "secondary",
      "btn-accent": color === "accent",
      "btn-info": color === "info",
      "btn-success": color === "success",
      "btn-warning": color === "warning",
      "btn-error": color === "error",
      "btn-ghost": color === "ghost",
      glass: glass,
      "btn-wide": wide,
      "btn-block": fullWidth,
      "btn-xs sm:btn-sm md:btn-md lg:btn-lg": responsive,
      "no-animation": !animation,
      "btn-active": active,
      "btn-disabled": disabled,
    });
    if (VoidElementList.includes(Tag)) {
      return (
        <Tag
          {...props}
          ref={ref}
          data-theme={dataTheme}
          className={classes}
          style={style}
          disabled={disabled}
        />
      );
    } else {
      return (
        <Tag
          {...props}
          ref={ref}
          data-theme={dataTheme}
          className={classes}
          style={style}
          disabled={disabled}
        >
          {loading && <Loading size={size} />}
          {startIcon && !loading && startIcon}
          {children}
          {endIcon && endIcon}
        </Tag>
      );
    }
  }
);

Button.displayName = "Button";

export default Button;
