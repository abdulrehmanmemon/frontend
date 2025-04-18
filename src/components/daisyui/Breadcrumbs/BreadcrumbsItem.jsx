import { forwardRef } from "react";
import { Link } from "react-router-dom";

const BreadcrumbsItem = forwardRef(({ children, href, ...props }, ref) => {
  return (
    <li {...props} ref={ref}>
      {href ? <Link to={href}>{children}</Link> : <>{children}</>}
    </li>
  );
});

BreadcrumbsItem.displayName = "Breadcrumbs Item";

export default BreadcrumbsItem;
