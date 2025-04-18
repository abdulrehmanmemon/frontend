import { cn } from "@/helpers";

const CollapseContent = ({ children, className, ...props }) => {
  const classes = cn("collapse-content", className);

  return (
    <div {...props} className={classes}>
      {children}
    </div>
  );
};

export default CollapseContent;
