import { forwardRef } from "react";

import { cn } from "@/helpers";

const CardBody = forwardRef(({ className, ...props }, ref) => (
  <div {...props} className={cn("card-body", className)} ref={ref} />
));

CardBody.displayName = "Card Body";

export default CardBody;
