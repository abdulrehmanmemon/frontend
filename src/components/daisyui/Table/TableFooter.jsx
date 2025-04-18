import { forwardRef } from "react";

const TableFooter = forwardRef(({ children, ...props }, ref) => {
  return (
    <tfoot {...props} ref={ref}>
      <tr>
        {children?.map((child, i) => {
          return <th key={i}>{child}</th>;
        })}
      </tr>
    </tfoot>
  );
});

TableFooter.displayName = "Table Footer";

export default TableFooter;
