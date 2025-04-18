import { cn } from "@/helpers";

const Countdown = ({ value, dataTheme, className, ...props }) => {
  const classes = cn("countdown", className);

  const displayedValue = Math.min(99, Math.max(0, value));
  const countdownStyle = { "--value": displayedValue };

  return (
    <span role="timer" {...props} data-theme={dataTheme} className={classes}>
      <span style={countdownStyle} />
    </span>
  );
};

export default Countdown;
