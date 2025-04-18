import { forwardRef } from "react";

import { cn } from "@/helpers";

const ModalActions = forwardRef(({ children, className, ...props }, ref) => {
  const classes = cn("modal-action", className);
  return (
    <div {...props} className={classes} ref={ref}>
      {children}
    </div>
  );
});

ModalActions.displayName = "ModalActions";

export default ModalActions;
