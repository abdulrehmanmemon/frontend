import { forwardRef } from "react";

import { cn } from "@/helpers";

const AvatarGroup = forwardRef(({ children, className, ...props }, ref) => {
  const classes = cn("avatar-group -space-x-6", className);

  return (
    <div
      aria-label={`Group of ${children.length} avatar photos`}
      {...props}
      className={classes}
      ref={ref}
    >
      {children}
    </div>
  );
});

AvatarGroup.displayName = "Avatar Group";

export default AvatarGroup;
