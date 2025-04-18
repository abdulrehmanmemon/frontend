import { forwardRef } from "react";

import { cn } from "@/helpers";

const Join = forwardRef(
  (
    {
      dataTheme,
      className,
      children,
      responsive,
      vertical,
      horizontal,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "join",
      {
        "join-vertical": !responsive && vertical,
        "join-horizontal": !responsive && horizontal,
        "join-vertical lg:join-horizontal": responsive,
      },
      className
    );

    return (
      <div {...props} data-theme={dataTheme} className={classes} ref={ref}>
        {children}
      </div>
    );
  }
);

Join.displayName = "Join";

export default Join;
