import { forwardRef } from "react";

const TableBody = forwardRef(({ children, ...props }, ref) => {
  return (
    <tbody {...props} ref={ref}>
      {children}
    </tbody>
  );
});

TableBody.displayName = "TableBody";

export default TableBody;
