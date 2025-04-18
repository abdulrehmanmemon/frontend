import { forwardRef } from "react";

import { cn } from "@/helpers";

const DYNAMIC_MODIFIERS = {
  compact: {
    true: "card-compact",
    xs: "xs:card-compact",
    sm: "sm:card-compact",
    md: "md:card-compact",
    lg: "lg:card-compact",
  },
  normal: {
    true: "card-normal",
    xs: "xs:card-normal",
    sm: "sm:card-normal",
    md: "md:card-normal",
    lg: "lg:card-normal",
  },
  side: {
    true: "card-side",
    xs: "xs:card-side",
    sm: "sm:card-side",
    md: "md:card-side",
    lg: "lg:card-side",
  },
};

const Card = forwardRef(
  (
    { bordered = true, imageFull, normal, compact, side, className, ...props },
    ref
  ) => {
    const classes = cn("card", className, {
      "card-bordered": bordered,
      "image-full": imageFull,
      [(compact && DYNAMIC_MODIFIERS.compact[compact.toString()]) || ""]:
        compact,
      [(normal && DYNAMIC_MODIFIERS.normal[normal.toString()]) || ""]: normal,
      [(side && DYNAMIC_MODIFIERS.side[side.toString()]) || ""]: side,
    });

    return <div aria-label="Card" {...props} className={classes} ref={ref} />;
  }
);

Card.displayName = "Card";

export default Card;
