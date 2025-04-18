import { cn } from "@/helpers";

const classesFn = ({ className }) => cn("collapse-title", className);

const CollapseTitle = ({ children, className, ...props }) => {
  return (
    <div {...props} className={classesFn({ className })}>
      {children}
    </div>
  );
};

export default CollapseTitle;
