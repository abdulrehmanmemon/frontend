import { forwardRef } from "react";

import { cn } from "@/helpers";

const Link = forwardRef(
  (
    { children, href, color, hover = true, dataTheme, className, ...props },
    ref
  ) => {
    const classes = cn("link", className, {
      "link-neutral": color === "neutral",
      "link-primary": color === "primary",
      "link-secondary": color === "secondary",
      "link-accent": color === "accent",
      "link-info": color === "info",
      "link-success": color === "success",
      "link-warning": color === "warning",
      "link-error": color === "error",
      "link-hover": hover,
    });

    return (
      <a
        rel="noopener noreferrer"
        {...props}
        href={href}
        data-theme={dataTheme}
        className={classes}
        ref={ref}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = "Link";

export default Link;
