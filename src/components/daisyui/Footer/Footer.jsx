import { forwardRef } from "react";

import { cn } from "@/helpers";

const Footer = forwardRef(({ center, dataTheme, className, ...props }, ref) => {
  const classes = cn("footer", className, {
    "footer-center": center,
  });

  return (
    <div
      role="contentinfo"
      {...props}
      data-theme={dataTheme}
      className={classes}
      ref={ref}
    />
  );
});

Footer.displayName = "Footer";

export default Footer;
