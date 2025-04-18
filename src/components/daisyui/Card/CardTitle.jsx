import { forwardRef } from "react";

import { cn } from "@/helpers";

const CardTitle = forwardRef(({ className, tag = "div", ...props }, ref) => {
  const Tag = tag;

  return <Tag {...props} className={cn("card-title", className)} ref={ref} />;
});

CardTitle.displayName = "Card title";

export default CardTitle;
