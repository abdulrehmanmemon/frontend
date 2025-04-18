import { forwardRef } from "react";

import { cn } from "@/helpers";

const CardActions = forwardRef(({ className, ...props }, ref) => (
  <div {...props} className={cn("card-actions", className)} ref={ref} />
));

CardActions.displayName = "Card actions";

export default CardActions;
