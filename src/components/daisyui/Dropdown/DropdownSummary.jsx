import { forwardRef } from "react";

import { Button } from "../Button";

export const DropdownSummary = forwardRef((props, ref) => {
  // @ts-ignore
  return <Button {...props} ref={ref} tag="summary" />;
});

DropdownSummary.displayName = "Dropdown Summary";

export default DropdownSummary;
