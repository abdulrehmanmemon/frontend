import { forwardRef } from "react";

import { cn } from "@/helpers";

const TableRow = forwardRef(
  ({ children, active, hover, className, ...props }, ref) => {
    const classes = cn(className, {
      active: active,
      hover: hover,
    });

    return (
      <tr {...props} className={classes} ref={ref}>
        {children?.map((child, i) =>
          i < 1 ? <th key={i}>{child}</th> : <td key={i}>{child}</td>
        )}
      </tr>
    );
  }
);

TableRow.displayName = "Table Row";

export default TableRow;
