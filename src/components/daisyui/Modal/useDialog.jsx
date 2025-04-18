import { useCallback, useRef } from "react";

import Modal from "@/components/daisyui/Modal/Modal";

export const useDialog = () => {
  const dialogRef = useRef(null);

  const handleShow = useCallback(() => {
    dialogRef.current?.showModal();
  }, [dialogRef]);

  const handleHide = useCallback(() => {
    dialogRef.current?.close();
  }, [dialogRef]);

  const Dialog = ({ children, ...props }) => {
    return (
      <Modal {...props} ref={dialogRef}>
        {children}
      </Modal>
    );
  };
  Dialog.displayName = "Dialog";
  return { dialogRef, Dialog, handleShow, handleHide };
};
