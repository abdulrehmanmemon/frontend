import { forwardRef } from "react";

import { cn } from "@/helpers";

const Badge = forwardRef(
  (
    {
      children,
      variant,
      outline,
      size,
      color,
      responsive,
      dataTheme,
      className,
      ...props
    },
    ref
  ) => {
    const classes = cn("badge", className, {
      "badge-lg": size === "lg",
      "badge-md": size === "md",
      "badge-sm": size === "sm",
      "badge-xs": size === "xs",
      "badge-outline": variant === "outline" || outline,
      "badge-neutral": color === "neutral",
      "badge-primary": color === "primary",
      "badge-secondary": color === "secondary",
      "badge-accent": color === "accent",
      "badge-ghost": color === "ghost",
      "badge-info": color === "info",
      "badge-success": color === "success",
      "badge-warning": color === "warning",
      "badge-error": color === "error",
      "badge-xs md:badge-sm lg:badge-md xl:badge-lg": responsive,
    });

    return (
      <div
        aria-label="Badge"
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

Badge.displayName = "Badge";

export default Badge;
