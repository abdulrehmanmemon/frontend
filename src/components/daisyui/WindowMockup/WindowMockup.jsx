import { Children, cloneElement, forwardRef, isValidElement } from "react";

import { cn } from "@/helpers";

import { bgColors, brandColors, componentStatuses } from "../constants";

export const windowMockupColors = [
  ...bgColors,
  ...brandColors,
  ...componentStatuses,
];

const WindowMockup = forwardRef(
  (
    {
      border,
      borderColor,
      backgroundColor,
      frameColor,
      dataTheme,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Set border color to framecolor or 'bg-base-300', if border color is not defined
    const borderColorValue = borderColor
      ? borderColor
      : frameColor || "base-300";

    const classes = cn(
      "mockup-window",
      border && `border border-${borderColorValue}`,
      {
        "border-primary": borderColorValue === "primary",
        "border-secondary": borderColorValue === "secondary",
        "border-accent": borderColorValue === "accent",
        "border-info": borderColorValue === "info",
        "border-success": borderColorValue === "success",
        "border-warning": borderColorValue === "warning",
        "border-error": borderColorValue === "error",
        "border-base-100": borderColorValue === "base-100",
        "border-base-200": borderColorValue === "base-200",
        "border-base-300": borderColorValue === "base-300",
        "border-neutral": borderColorValue === "neutral",
        "bg-primary": frameColor === "primary",
        "bg-secondary": frameColor === "secondary",
        "bg-accent": frameColor === "accent",
        "bg-info": frameColor === "info",
        "bg-success": frameColor === "success",
        "bg-warning": frameColor === "warning",
        "bg-error": frameColor === "error",
        "bg-base-100": frameColor === "base-100",
        "bg-base-200": frameColor === "base-200",
        "bg-base-300": frameColor === "base-300",
        "bg-neutral": frameColor === "neutral",
      },
      className
    );

    // If border is true, then we need to add the border-t and padding classes to the children
    // if more than one child is passed in, or the single child is not a valid element, then we need to wrap the child/children in a div

    const numChildren = Children.count(children);
    const firstChild = numChildren > 0 && Children.toArray(children)[0];

    // List of classes that child element will have
    const innerClasses = cn(
      backgroundColor && `bg-${backgroundColor}`,
      border && `border-t border-${borderColorValue}`,
      "p-4"
    );

    // Add the innerClasses to the child element, merging classNames if existing, or wrapping with div and adding innerClasses
    const innerEl =
      firstChild && isValidElement(firstChild) ? (
        cloneElement(firstChild, {
          className: cn(innerClasses, firstChild.props.className),
        })
      ) : (
        <div className={innerClasses}>{children}</div>
      );

    return (
      <div
        aria-label="Window mockup"
        {...props}
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        {innerEl}
      </div>
    );
  }
);

WindowMockup.displayName = "WindowMockup";

export default WindowMockup;
