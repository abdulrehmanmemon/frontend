import { forwardRef } from "react";

const ModalBody = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div {...props} className={className} ref={ref}>
      {children}
    </div>
  );
});

ModalBody.displayName = "ModalBody";

export default ModalBody;
