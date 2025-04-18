import { forwardRef } from "react";

import { cn } from "@/helpers";

const Modal = forwardRef(
  (
    { children, open, responsive, backdrop, dataTheme, className, ...props },
    ref
  ) => {
    const containerClasses = cn("modal", {
      "modal-open": open,
      "modal-bottom sm:modal-middle": responsive,
    });

    const bodyClasses = cn("modal-box", className);

    return (
      <dialog
        {...props}
        aria-label="Modal"
        // aria-hidden={!open}
        open={open}
        aria-modal={open}
        data-theme={dataTheme}
        className={containerClasses}
        ref={ref}
      >
        <div data-theme={dataTheme} className={bodyClasses}>
          {children}
        </div>
        {backdrop && (
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        )}
      </dialog>
    );
  }
);

Modal.displayName = "Modal";

export default Modal;
