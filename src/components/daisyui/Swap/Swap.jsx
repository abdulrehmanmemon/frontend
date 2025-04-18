import { forwardRef } from "react";

import { cn } from "@/helpers";

import { wrapWithElementIfInvalid } from "../utils";

const Swap = forwardRef(
  (
    {
      onElement,
      offElement,
      active,
      rotate,
      flip,
      dataTheme,
      className,
      onClick,
      onChange,
      ...props
    },
    ref
  ) => {
    const classes = cn("swap", className, {
      "swap-active": active,
      "swap-rotate": rotate,
      "swap-flip": flip,
    });

    // These next two pieces allow classname to be added to valid elements, or wrap invalid elements with a div and the classname
    const onEl = wrapWithElementIfInvalid({
      node: onElement,
      wrapper: <div></div>,
      props: { className: "swap-on" },
    });

    const offEl = wrapWithElementIfInvalid({
      node: offElement,
      wrapper: <div></div>,
      props: { className: "swap-off" },
    });

    return (
      <label {...props} data-theme={dataTheme} className={classes} ref={ref}>
        <input type="checkbox" onClick={onClick} onChange={onChange} />
        {onEl}
        {offEl}
      </label>
    );
  }
);

Swap.displayName = "Swap";

export default Swap;
