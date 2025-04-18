import { forwardRef } from "react";

const TableHead = forwardRef(({ children, ...props }, ref) => {
  return (
    <thead {...props} ref={ref}>
      <tr>
        {children?.map((child, i) => {
          return <th key={i}>{child}</th>;
        })}
      </tr>
    </thead>
  );
});

TableHead.displayName = "Table Head";

export default TableHead;
