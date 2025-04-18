import { forwardRef } from "react";

import { cn } from "@/helpers";

const ModalHeader = forwardRef(({ children, className, ...props }, ref) => {
  const classes = cn("w-full mb-8 text-xl", className);
  return (
    <div {...props} className={classes} ref={ref}>
      {children}
    </div>
  );
});

ModalHeader.displayName = "ModalHeader";

export default ModalHeader;
