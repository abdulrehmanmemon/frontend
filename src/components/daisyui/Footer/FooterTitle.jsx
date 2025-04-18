import { forwardRef } from "react";

import { cn } from "@/helpers";

const FooterTitle = forwardRef(({ className, ...props }, ref) => {
  const classes = cn("footer-title", className);

  return <span {...props} className={classes} ref={ref} />;
});

FooterTitle.displayName = "Footer Title";

export default FooterTitle;
