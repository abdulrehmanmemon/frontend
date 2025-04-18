import { forwardRef } from "react";

// type NoAnchor = Exclude<Anchor, "anchor"> & { anchor?: false };

// export type DropdownItemProps = Anchor | NoAnchor;

const DropdownItem = forwardRef(({ anchor = true, ...props }, ref) => {
  return <li>{anchor ? <a ref={ref} {...props}></a> : props.children}</li>;
});

DropdownItem.displayName = "Dropdown Item";

export default DropdownItem;
