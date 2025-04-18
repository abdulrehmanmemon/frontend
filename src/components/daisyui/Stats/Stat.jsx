import { forwardRef } from "react";

import { cn } from "@/helpers";

import StatSection from "./StatSection";

const Stat = forwardRef(({ dataTheme, className, ...props }, ref) => {
  const classes = cn("stat", className);

  return (
    <div {...props} data-theme={dataTheme} className={classes} ref={ref} />
  );
});

const StatTitle = forwardRef((props, ref) => (
  <StatSection {...props} section="title" ref={ref} />
));

const StatValue = forwardRef((props, ref) => (
  <StatSection {...props} section="value" ref={ref} />
));

const StatDesc = forwardRef((props, ref) => (
  <StatSection {...props} section="desc" ref={ref} />
));

const StatFigure = forwardRef((props, ref) => (
  <StatSection {...props} section="figure" ref={ref} />
));

const StatActions = forwardRef((props, ref) => (
  <StatSection {...props} section="actions" ref={ref} />
));

Stat.displayName = "Stat";
StatTitle.displayName = "Stat title";
StatValue.displayName = "Stat value";
StatDesc.displayName = "Stat desc";
StatFigure.displayName = "Stat figure";
StatActions.displayName = "Stat actions";

export default Stat;

export { StatTitle, StatValue, StatDesc, StatFigure, StatActions };
